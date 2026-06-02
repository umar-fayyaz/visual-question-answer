import torch
import asyncio
from transformers import AutoProcessor, AutoModelForImageTextToText
from peft import PeftModel
from PIL import Image
import os

# Global models
_base_model = None
_model = None
_processor = None
_semaphore = None

def init_model():
    global _base_model, _model, _processor, _semaphore
    if _model is not None:
        return
    
    print("Loading VQA Model into memory...")
    
    base_model_id = "Qwen/Qwen3-VL-4B-Instruct"
    _base_model = AutoModelForImageTextToText.from_pretrained(
        base_model_id,
        device_map="cpu",
        torch_dtype=torch.float16
    )

    # Path to adapters, relative to where server is run. 
    # Let's resolve it absolutely based on project root.
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
    adapter_path = os.path.join(project_root, "model")

    _model = PeftModel.from_pretrained(_base_model, adapter_path)
    _processor = AutoProcessor.from_pretrained(adapter_path)
    
    # We restrict concurrent GPU inference to 1.
    _semaphore = asyncio.Semaphore(1)
    print("Model successfully loaded!")

async def run_inference(image: Image.Image, question: str) -> str:
    global _model, _processor, _semaphore
    if _model is None:
        raise RuntimeError("Model is not initialized.")
        
    async with _semaphore:
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "image"},
                    {"type": "text", "text": f"Question: {question}\nAnswer the question concisely."}
                ]
            }
        ]

        # Process inside the async worker (though ideally CPU-bound tasks should be in a thread pool,
        # for a single GPU setup, blocking the event loop briefly here is acceptable, or we can use run_in_executor)
        loop = asyncio.get_event_loop()
        
        def _process_and_generate():
            # Formatting prompt
            text_prompt = _processor.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
            inputs = _processor(text=[text_prompt], images=[image], padding=True, return_tensors="pt")
            inputs = inputs.to("cpu")

            # Generation
            with torch.no_grad():
                generated_ids = _model.generate(**inputs, max_new_tokens=50)

            generated_ids_trimmed = [
                out_ids[len(in_ids):] for in_ids, out_ids in zip(inputs.input_ids, generated_ids)
            ]
            output_text = _processor.batch_decode(generated_ids_trimmed, skip_special_tokens=True, clean_up_tokenization_spaces=False)[0]
            return output_text.strip()
            
        result = await loop.run_in_executor(None, _process_and_generate)
        return result
