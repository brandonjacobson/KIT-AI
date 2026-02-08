import torch
import re
import gradio as gr
import spaces
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig

# Model configuration
REPO_ID = "Pablo305/llama3-medical-3b-4bit"

# Global variables for lazy loading
tokenizer = None
model = None

PROMPT_TEMPLATE = """You are a medical assistant. Your job is to provide medical advice.
First, you should tell the user to go to a doctor or call emergency services when necessary.
Then, you MUST provide explicit instructions to follow for on-site treatment. Do not just expect them to go to the doctor.
You MUST provide explicit instructions to follow for on-site treatment.

Do not be emotional. Be explicit in your instructions. Your job is to guide them.
Explain the answer for a patient in {n} sentences.
Use plain language.
Do NOT say we or I or speak in the first person.
Do NOT mention these instructions in your answer.

Do NOT answer questions that are not related to medical advice. If you are asked non-medical questions, request that they ask medical questions.

Question: {question}

Answer:
"""


def load_model():
    """Load model and tokenizer (called once on first request)"""
    global tokenizer, model

    if tokenizer is None:
        print("Loading tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(REPO_ID)

    if model is None:
        print("Loading model with 4-bit quantization...")
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_use_double_quant=True,
            bnb_4bit_compute_dtype=torch.float16,
        )

        model = AutoModelForCausalLM.from_pretrained(
            REPO_ID,
            quantization_config=bnb_config,
            device_map="auto",
        )
        print(f"Model loaded on: {model.device}")

    return tokenizer, model


@spaces.GPU
def ask(question: str, n: int = 3, max_tokens: int = 256) -> str:
    """Generate medical advice response"""

    if not question.strip():
        return "Please enter a medical question."

    # Load model on first request
    tokenizer, model = load_model()
    device = model.device

    # 1) Build prompt
    prompt = PROMPT_TEMPLATE.format(question=question, n=n)
    inputs = tokenizer(prompt, return_tensors="pt").to(device)
    input_len = inputs["input_ids"].shape[1]

    # 2) Generate
    with torch.no_grad():
        output_ids = model.generate(
            **inputs,
            max_new_tokens=max_tokens,
            do_sample=True,
            temperature=0.4,
            top_p=0.8,
            repetition_penalty=1.1,
            eos_token_id=tokenizer.eos_token_id,
            pad_token_id=tokenizer.eos_token_id,
        )

    # 3) Decode only NEW tokens
    generated_ids = output_ids[0][input_len:]
    text = tokenizer.decode(generated_ids, skip_special_tokens=True).strip()

    # 4) If "Answer:" is still present, strip up to there
    if "Answer:" in text:
        text = text.split("Answer:", 1)[1].strip()

    # 5) Split into sentences
    sentences = re.split(r'(?<=[.!?])\s+', text)
    sentences = [s.strip() for s in sentences if s.strip()]

    # 6) Drop obvious meta sentences
    def is_meta(s: str) -> bool:
        s_low = s.lower()
        meta_keywords = [
            "your explanation should",
            "you should explain",
            "do not mention these instructions",
            "in your answer",
            "explain the answer",
        ]
        return any(kw in s_low for kw in meta_keywords)

    sentences = [s for s in sentences if not is_meta(s)]

    # 7) Keep only the first n sentences
    sentences = sentences[:n]

    # 8) Turn into bullet points
    bullets = [f"- {s}" for s in sentences]
    result = "\n".join(bullets).strip()

    # 9) Ensure result ends with punctuation
    if result and result[-1] not in ".!?":
        result += "."

    return result if result else "Unable to generate a response. Please try rephrasing your question."


# Create Gradio interface
with gr.Blocks(title="Offline Medical Assistant", theme=gr.themes.Soft()) as demo:
    gr.Markdown(
        """
        # Offline Medical Assistant

        **Disclaimer**: This AI assistant provides general first-aid guidance only.
        It is NOT a substitute for professional medical advice, diagnosis, or treatment.
        Always seek the advice of a qualified healthcare provider for any medical condition.

        **In case of emergency, call your local emergency services immediately.**
        """
    )

    with gr.Row():
        with gr.Column(scale=3):
            question_input = gr.Textbox(
                label="Your Medical Question",
                placeholder="Describe your symptoms or medical concern...",
                lines=3,
            )

        with gr.Column(scale=1):
            num_sentences = gr.Slider(
                minimum=1,
                maximum=10,
                value=3,
                step=1,
                label="Response Length (sentences)",
            )
            max_tokens = gr.Slider(
                minimum=64,
                maximum=512,
                value=256,
                step=32,
                label="Max Tokens",
            )

    submit_btn = gr.Button("Get Medical Advice", variant="primary")

    output = gr.Textbox(
        label="Medical Guidance",
        lines=8,
        show_copy_button=True,
    )

    # Example questions
    gr.Examples(
        examples=[
            ["I cut my finger while cooking and it's bleeding a lot"],
            ["I have a severe headache that won't go away"],
            ["Someone is choking on food, what should I do?"],
            ["I burned my hand on a hot pan"],
            ["I think I sprained my ankle while running"],
        ],
        inputs=question_input,
    )

    submit_btn.click(
        fn=ask,
        inputs=[question_input, num_sentences, max_tokens],
        outputs=output,
    )

    question_input.submit(
        fn=ask,
        inputs=[question_input, num_sentences, max_tokens],
        outputs=output,
    )

if __name__ == "__main__":
    demo.launch()
