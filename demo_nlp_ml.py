import os
import sys
import json

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from src.nlp_ml_pipeline import FakeNewsNLPPipeline
from src.ml.train import train_and_evaluate_model



def print_section_header(title: str):
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)


def run_demo():
    print_section_header("1. Training Core Machine Learning Model")
    train_and_evaluate_model(model_output_path="models/fake_news_model.joblib", sample_limit=1000)

    print_section_header("2. Initializing NLP & ML Analysis Pipeline Facade")
    pipeline = FakeNewsNLPPipeline(model_path="models/fake_news_model.joblib")

    # Sample 1: Authentic News Article
    authentic_article = (
        "The U.S. Department of Commerce reported on Tuesday that retail sales increased by 0.7% last month, "
        "exceeding economic forecasts. Analysts attributed the growth to steady consumer demand and strong labor market conditions. "
        "Federal Reserve Chairman Jerome Powell noted in Washington that monetary policy adjustments remain data-dependent."
    )

    # Sample 2: Sensational Misinformation Article
    fake_article = (
        "SHOCKING SECRET EXPOSED!!! Top government insiders confirm unbelievable alien technology was found in secret bunker! "
        "You won't believe what they are hiding from us! Share this before it gets deleted! "
        "Unnamed sources claim 100% proof exists that shadow organizations control global weather!!!"
    )

    verified_references = [
        "Department of Commerce economic reports show retail sales rose by 0.7% last month.",
        "Federal Reserve officials in Washington stated interest rate policy depends on economic data."
    ]

    print_section_header("3. Analyzing Authentic News Article")
    res_real = pipeline.analyze_text(authentic_article, reference_texts=verified_references)
    print(f"Article: {authentic_article}\n")
    print(f"Verdict:              {res_real['classification']['verdict']}")
    print(f"Real Probability:     {res_real['classification']['real_probability'] * 100:.1f}%")
    print(f"Fake Probability:     {res_real['classification']['fake_probability'] * 100:.1f}%")
    print(f"Risk Category:        {res_real['confidence_assessment']['risk_category']}")
    print(f"Confidence Score:     {res_real['confidence_assessment']['confidence_percentage']}%")
    print(f"Extracted Entities:   {res_real['claims_and_entities']['total_entities']}")
    print(f"Extracted Claims:     {res_real['claims_and_entities']['extracted_claims_count']}")
    print(f"Semantic Consensus:   {res_real['semantic_consensus']['overall_consensus_score'] * 100:.1f}%")
    print(f"Reassuring Cues:      {res_real['confidence_assessment']['reassuring_cues']}")

    print_section_header("4. Analyzing Sensational Misinformation Article")
    res_fake = pipeline.analyze_text(fake_article, reference_texts=verified_references)
    print(f"Article: {fake_article}\n")
    print(f"Verdict:              {res_fake['classification']['verdict']}")
    print(f"Real Probability:     {res_fake['classification']['real_probability'] * 100:.1f}%")
    print(f"Fake Probability:     {res_fake['classification']['fake_probability'] * 100:.1f}%")
    print(f"Risk Category:        {res_fake['confidence_assessment']['risk_category']}")
    print(f"Confidence Score:     {res_fake['confidence_assessment']['confidence_percentage']}%")
    print(f"Extracted Entities:   {res_fake['claims_and_entities']['total_entities']}")
    print(f"Extracted Claims:     {res_fake['claims_and_entities']['extracted_claims_count']}")
    print(f"Risk Factors:         {res_fake['confidence_assessment']['risk_factors']}")

    print_section_header("5. Detailed JSON Breakdown of Analysis")
    print(json.dumps(res_fake, indent=2))


if __name__ == "__main__":
    run_demo()
