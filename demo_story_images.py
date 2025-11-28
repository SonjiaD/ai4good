"""
Demo Script for Story Image Generation Feature

This script demonstrates how to use the story illustration API to:
1. Upload a PDF storybook
2. Generate AI-powered illustrations for key scenes
3. Retrieve and display the generated images

Requirements:
- Flask backend running on http://localhost:5000
- Valid OPENAI_API_KEY and GEMINI_API_KEY in backend/.env
- A sample PDF storybook file

Usage:
    python demo_story_images.py <path_to_pdf> [--max-pages N] [--size SIZE] [--kid-style on/off]
    
Examples:
    python demo_story_images.py story.pdf
    python demo_story_images.py story.pdf --max-pages 5 --size 1024x1024 --kid-style on
"""

import requests
import sys
import argparse
import time
import json
from pathlib import Path


# Configuration
API_BASE_URL = "http://localhost:5000"
ASYNC_ENDPOINT = f"{API_BASE_URL}/images/story/async"
SYNC_ENDPOINT = f"{API_BASE_URL}/images/story"
JOB_STATUS_ENDPOINT = f"{API_BASE_URL}/images/story/async"


def parse_args():
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description="Demo script for AI story illustration generation",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument(
        "pdf_path",
        type=str,
        help="Path to the PDF storybook file"
    )
    parser.add_argument(
        "--max-pages",
        type=int,
        default=3,
        help="Maximum number of illustrations to generate (default: 3)"
    )
    parser.add_argument(
        "--size",
        type=str,
        default="1024x1024",
        choices=["1024x1024", "1024x1536", "1536x1024"],
        help="Image size (default: 1024x1024)"
    )
    parser.add_argument(
        "--kid-style",
        type=str,
        default="on",
        choices=["on", "off"],
        help="Apply kid-friendly illustration style (default: on)"
    )
    parser.add_argument(
        "--reader-age",
        type=int,
        default=None,
        help="Reader age for age-appropriate styling (e.g., 7, 10)"
    )
    parser.add_argument(
        "--async",
        dest="use_async",
        action="store_true",
        help="Use async endpoint (better for multiple pages)"
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default="demo_output",
        help="Directory to save generated images (default: demo_output)"
    )
    
    return parser.parse_args()


def check_server_health():
    """Check if the Flask backend is running."""
    try:
        response = requests.get(f"{API_BASE_URL}/images/test-openai", timeout=5)
        if response.status_code == 200:
            print("✅ Server is running and OpenAI connection is healthy")
            return True
        else:
            print(f"⚠️ Server responded with status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to server at {API_BASE_URL}")
        print(f"   Error: {e}")
        print(f"   Please ensure the Flask backend is running:")
        print(f"   cd backend && python app.py")
        return False


def submit_sync_job(pdf_path: Path, form_data: dict):
    """Submit a synchronous job and wait for completion."""
    print(f"\n📤 Submitting synchronous request...")
    print(f"   PDF: {pdf_path.name}")
    print(f"   Max pages: {form_data.get('max_pages')}")
    print(f"   Image size: {form_data.get('size')}")
    print(f"   Kid style: {form_data.get('kid_style')}")
    
    with open(pdf_path, 'rb') as f:
        files = {'pdf': (pdf_path.name, f, 'application/pdf')}
        
        try:
            response = requests.post(
                SYNC_ENDPOINT,
                files=files,
                data=form_data,
                timeout=300  # 5 minute timeout
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"❌ Request failed with status {response.status_code}")
                print(f"   Response: {response.text}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Request error: {e}")
            return None


def submit_async_job(pdf_path: Path, form_data: dict):
    """Submit an async job and return the job ID."""
    print(f"\n📤 Submitting async request...")
    print(f"   PDF: {pdf_path.name}")
    print(f"   Max pages: {form_data.get('max_pages')}")
    print(f"   Image size: {form_data.get('size')}")
    print(f"   Kid style: {form_data.get('kid_style')}")
    
    with open(pdf_path, 'rb') as f:
        files = {'pdf': (pdf_path.name, f, 'application/pdf')}
        
        try:
            response = requests.post(
                ASYNC_ENDPOINT,
                files=files,
                data=form_data,
                timeout=30
            )
            
            if response.status_code == 202:
                result = response.json()
                job_id = result.get('job_id')
                print(f"✅ Job submitted successfully!")
                print(f"   Job ID: {job_id}")
                return job_id
            else:
                print(f"❌ Request failed with status {response.status_code}")
                print(f"   Response: {response.text}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Request error: {e}")
            return None


def poll_job_status(job_id: str, max_wait: int = 300):
    """Poll the job status until completion or timeout."""
    print(f"\n⏳ Polling job status (max wait: {max_wait}s)...")
    
    start_time = time.time()
    last_progress_count = 0
    
    while time.time() - start_time < max_wait:
        try:
            response = requests.get(f"{JOB_STATUS_ENDPOINT}/{job_id}", timeout=10)
            
            if response.status_code == 200:
                job_data = response.json()
                status = job_data.get('status')
                progress = job_data.get('progress', [])
                
                # Print new progress messages
                if len(progress) > last_progress_count:
                    for msg in progress[last_progress_count:]:
                        print(f"   📋 {msg}")
                    last_progress_count = len(progress)
                
                if status == 'done':
                    print(f"✅ Job completed successfully!")
                    return job_data.get('result')
                elif status == 'error':
                    print(f"❌ Job failed!")
                    print(f"   Error: {job_data.get('error')}")
                    return None
                elif status in ['queued', 'running']:
                    # Continue polling
                    time.sleep(2)
                else:
                    print(f"⚠️ Unknown status: {status}")
                    time.sleep(2)
            else:
                print(f"⚠️ Status check failed: {response.status_code}")
                time.sleep(2)
                
        except requests.exceptions.RequestException as e:
            print(f"⚠️ Polling error: {e}")
            time.sleep(2)
    
    print(f"⏱️ Timeout reached after {max_wait}s")
    return None


def save_images_from_data_urls(images: list, output_dir: Path):
    """Save images from base64 data URLs to files."""
    import base64
    
    output_dir.mkdir(parents=True, exist_ok=True)
    saved_files = []
    
    for img in images:
        if 'url' in img:
            url = img['url']
            page = img.get('page', 'unknown')
            
            # Check if it's a base64 data URL
            if url.startswith('data:image/png;base64,'):
                # Extract base64 data
                base64_data = url.split(',', 1)[1]
                png_bytes = base64.b64decode(base64_data)
                
                # Save to file
                filename = f"page_{page}.png"
                filepath = output_dir / filename
                
                with open(filepath, 'wb') as f:
                    f.write(png_bytes)
                
                saved_files.append(filepath)
                print(f"   💾 Saved: {filepath}")
    
    return saved_files


def display_results(result: dict, output_dir: Path):
    """Display the results and save images."""
    if not result:
        return
    
    print("\n" + "="*60)
    print("📊 RESULTS")
    print("="*60)
    
    # Summary
    message = result.get('message', 'N/A')
    count = result.get('count', 0)
    print(f"\nMessage: {message}")
    print(f"Images generated: {count}")
    
    # Story summary
    summary = result.get('summary', {})
    if summary:
        print(f"\n📖 Story Summary:")
        
        characters = summary.get('characters', [])
        if characters:
            print(f"   Characters:")
            for ch in characters:
                print(f"      • {ch}")
        
        setting = summary.get('setting', '')
        if setting:
            print(f"   Setting: {setting}")
    
    # Images
    images = result.get('images', [])
    if images:
        print(f"\n🖼️ Generated Images:")
        for img in images:
            page = img.get('page', 'unknown')
            prompt_preview = img.get('prompt', '')[:100] + '...' if len(img.get('prompt', '')) > 100 else img.get('prompt', '')
            print(f"   Page {page}:")
            print(f"      Prompt: {prompt_preview}")
            if 'error' in img:
                print(f"      ❌ Error: {img['error']}")
            else:
                print(f"      ✅ Generated successfully")
        
        # Save images
        print(f"\n💾 Saving images to {output_dir}/")
        saved_files = save_images_from_data_urls(images, output_dir)
        print(f"✅ Saved {len(saved_files)} images")
    
    print("\n" + "="*60)


def main():
    """Main demo function."""
    args = parse_args()
    
    # Validate PDF path
    pdf_path = Path(args.pdf_path)
    if not pdf_path.exists():
        print(f"❌ Error: PDF file not found: {pdf_path}")
        sys.exit(1)
    
    if not pdf_path.suffix.lower() == '.pdf':
        print(f"⚠️ Warning: File does not have .pdf extension: {pdf_path}")
    
    print("="*60)
    print("🎨 AI Story Illustration Demo")
    print("="*60)
    
    # Check server health
    if not check_server_health():
        sys.exit(1)
    
    # Prepare form data
    form_data = {
        'max_pages': str(args.max_pages),
        'size': args.size,
        'kid_style': args.kid_style,
    }
    
    if args.reader_age is not None:
        form_data['reader_age'] = str(args.reader_age)
    
    # Submit job
    if args.use_async:
        job_id = submit_async_job(pdf_path, form_data)
        if not job_id:
            sys.exit(1)
        
        # Poll for results
        result = poll_job_status(job_id, max_wait=300)
    else:
        result = submit_sync_job(pdf_path, form_data)
    
    # Display results
    output_dir = Path(args.output_dir)
    display_results(result, output_dir)
    
    if result:
        print("\n✨ Demo completed successfully!")
    else:
        print("\n❌ Demo failed - see errors above")
        sys.exit(1)


if __name__ == "__main__":
    main()
