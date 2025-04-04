from transformers import pipeline
import re

# Use a better model for instruction-following from Hugging Face
# flan-t5-base or flan-t5-small are good options for instruction following
generator = pipeline("text2text-generation", model="google/flan-t5-base")

def generate_tips(units_used, per_unit_cost, total_bill):
    """
    Generate electricity saving tips based on usage data.

    Args:
        units_used (float): Number of electricity units consumed
        per_unit_cost (float): Cost per unit of electricity
        total_bill (float): Total electricity bill amount

    Returns:
        str: Formatted string containing electricity saving tips
    """
    # Create a prompt that's more descriptive for the model
    prompt = (
        f"Generate 3 practical electricity saving tips for a household that uses {units_used} units "
        f"of electricity at {per_unit_cost} per unit, with a total bill of {total_bill}. "
        f"Focus on actionable advice that would help reduce consumption."
        f"just give tips, no extras"
    )

    # Use the model to generate suggestions
    response = generator(prompt, max_length=200, do_sample=True, temperature=0.7)
    generated_text = response[0]["generated_text"]

    # As a fallback in case the model doesn't generate good tips
    fallback_tips = [
        "Switch to LED bulbs to reduce lighting electricity consumption by up to 80%.",
        "Unplug electronic devices when not in use to eliminate standby power consumption.",
        "Use smart power strips to automatically cut power to devices when they're not needed."
    ]

    # Try to extract distinct tips from the generated text
    # Look for numbered patterns or list-like structures
    tips = []

    # First try to find numbered tips (e.g., "1. Tip one")
    numbered_tips = re.findall(r'\d+\.\s*(.*?)(?=\d+\.|$)', generated_text, re.DOTALL)
    if numbered_tips and len(numbered_tips) >= 3:
        tips = [tip.strip() for tip in numbered_tips[:3]]

    # If that doesn't work, try to split by newlines or sentences
    if len(tips) < 3:
        # Try splitting by newlines
        line_tips = [line.strip() for line in generated_text.split('\n') if line.strip()]
        # Or by sentences
        if len(line_tips) < 3:
            sentence_tips = [s.strip() for s in re.split(r'[.!?]+', generated_text) if s.strip()]
            line_tips = sentence_tips if len(sentence_tips) > len(line_tips) else line_tips

        tips = line_tips[:3]

    # If we still don't have enough tips, use fallbacks
    while len(tips) < 3:
        tips.append(fallback_tips.pop(0))

    # Format the tips as requested
    formatted_tips = "\n".join([f"{i+1}. {tip}" for i, tip in enumerate(tips)])

    return formatted_tips