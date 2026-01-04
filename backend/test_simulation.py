import requests
import json
import time
import sys
import os

# Configuration
BASE_URL = "http://127.0.0.1:8000"
HEADERS = {"Content-Type": "application/json"}

# Force UTF-8 for stdout
sys.stdout.reconfigure(encoding='utf-8')

def print_step(step_name):
    print(f"\n{'='*20} {step_name} {'='*20}")

def test_full_flow():
    print_step("Starting Full Flow Simulation")

    # 1. Start Assessment (Quick Mode)
    print("Step 1: Starting Assessment (Quick Mode)...")
    try:
        response = requests.post(
            f"{BASE_URL}/assessment/start", 
            json={"mode": "quick"},
            headers=HEADERS
        )
        response.raise_for_status()
        data = response.json()
        history = data["history"]
        print(f"AI: {data['message']}")
    except Exception as e:
        print(f"Failed to start assessment: {e}")
        return False

    # 2. Simulate User Responses (3 turns)
    user_responses = [
        "我小时候特别喜欢拆闹钟，虽然总是装不回去，但就是想看里面怎么转的。也被爸妈骂过好多次破坏大王。",
        "我觉得逻辑推理很简单啊，看到一个现象就能猜到背后的原因，朋友们都觉得我神叨叨的。",
        "我看别人画画画得特别好的时候，心里会有点酸，觉得自己明明也有想法但手跟不上。"
    ]

    for i, user_msg in enumerate(user_responses):
        print_step(f"Chat Round {i+1}")
        print(f"User: {user_msg}")
        
        try:
            payload = {
                "user_message": user_msg,
                "history": history
            }
            response = requests.post(
                f"{BASE_URL}/assessment/chat",
                json=payload,
                headers=HEADERS
            )
            response.raise_for_status()
            data = response.json()
            history = data["history"]
            print(f"AI: {data['message']}")
            
            if data.get("is_finished"):
                print("\n[AI indicated conversation is finished]")
                break
                
        except Exception as e:
            print(f"Chat failed: {e}")
            return False
            
        time.sleep(1) # Be nice to the API

    # 3. Generate Report
    print_step("Generating Report")
    try:
        # The frontend sends the history to generate the report
        payload = {
            "user_message": "", # Not used in generate_report but model expects structure
            "history": history
        }
        
        print("DEBUG: Sending report request...", flush=True)
        # Start timing
        start_time = time.time()
        response = requests.post(
            f"{BASE_URL}/assessment/report",
            json=payload,
            headers=HEADERS,
            timeout=120
        )
        duration = time.time() - start_time
        print(f"DEBUG: Report request returned status {response.status_code}", flush=True)
        print(f"Report generation took {duration:.2f} seconds")
        
        if response.status_code != 200:
            print(f"Report generation failed with status {response.status_code}")
            print(response.text)
            return False
            
        report_data = response.json()
        
        # 4. Validate Report Structure
        print_step("Validating Report Structure")
        required_keys = ["core_traits", "deep_analysis", "action_guide", "careers", "not_suitable"]
        missing_keys = [key for key in required_keys if key not in report_data]
        
        if missing_keys:
            print(f"❌ Validation FAILED. Missing keys: {missing_keys}")
            print("Received Data Keys:", report_data.keys())
            return False
        
        # Validate types
        if not isinstance(report_data["core_traits"], list):
            print("❌ Validation FAILED. 'core_traits' should be a list.")
            return False
            
        if not isinstance(report_data["careers"], list):
            print("❌ Validation FAILED. 'careers' should be a list.")
            return False
            
        # Check content length
        if len(report_data["deep_analysis"]) < 100:
             print("⚠️ Warning: 'deep_analysis' seems too short.")
        
        print("✅ Report Structure Validation PASSED!")
        
        # Save to file for inspection
        with open("report_result.json", "w", encoding="utf-8") as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)
        print("Report saved to report_result.json")
            
        print("\n--- Generated Report Content ---")
        print(json.dumps(report_data, indent=2, ensure_ascii=False))
        return True

    except Exception as e:
        print(f"Report generation exception: {e}")
        return False

if __name__ == "__main__":
    # Check if backend is likely running
    try:
        requests.get(f"{BASE_URL}/health", timeout=2)
    except:
        print("❌ Backend does not seem to be running at http://127.0.0.1:8000")
        print("Please start the backend in a separate terminal before running this test.")
        sys.exit(1)
        
    success = test_full_flow()
    if success:
        print("\n🎉 TEST COMPLETED SUCCESSFULLY")
        sys.exit(0)
    else:
        print("\n💥 TEST FAILED")
        sys.exit(1)
