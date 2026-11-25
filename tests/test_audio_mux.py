import unittest
import json
from pathlib import Path

from backend.processor import (
    build_audio_mux_command,
    calculate_even_crop_dimensions,
    clean_json_response,
    sanitize_segments,
    select_fallback_segments,
)


class TestPipelineComponents(unittest.TestCase):

    def test_audio_mux_command_keeps_optional_audio_track(self):
        cmd = build_audio_mux_command(
            Path("tmp_video.mp4"),
            Path("trimmed_clip.mp4"),
            Path("final_short.mp4"),
            ffmpeg_exe="ffmpeg",
        )

        self.assertEqual(cmd[0], "ffmpeg")
        self.assertIn("-map", cmd)
        self.assertEqual(cmd[cmd.index("-map") + 1], "0:v:0")
        self.assertEqual(cmd[cmd.index("-map", cmd.index("0:v:0") + 1) + 1], "1:a?")
        self.assertIn("-c:a", cmd)
        self.assertEqual(cmd[cmd.index("-c:a") + 1], "aac")

    def test_calculate_even_crop_dimensions_ensures_even_parity(self):
        # Test 1080p (1920x1080) -> 1080 * 9 / 16 = 607.5 -> MUST be even (606 or 608)
        target_w, target_h, x_offset = calculate_even_crop_dimensions(1920, 1080)
        self.assertEqual(target_w % 2, 0, f"Target width {target_w} must be even")
        self.assertEqual(target_h % 2, 0, f"Target height {target_h} must be even")
        self.assertEqual(x_offset % 2, 0, f"X offset {x_offset} must be even")
        self.assertTrue(target_w > 0 and target_w <= 1920)
        self.assertTrue(x_offset >= 0)

        # Test 720p (1280x720)
        w720, h720, off720 = calculate_even_crop_dimensions(1280, 720)
        self.assertEqual(w720 % 2, 0)
        self.assertEqual(h720 % 2, 0)
        self.assertEqual(off720 % 2, 0)

        # Test 4K (3840x2160)
        w4k, h4k, off4k = calculate_even_crop_dimensions(3840, 2160)
        self.assertEqual(w4k % 2, 0)
        self.assertEqual(h4k % 2, 0)
        self.assertEqual(off4k % 2, 0)

    def test_clean_json_response_strips_reasoning_and_markdown(self):
        raw_with_think = """
        <think>
        Let's analyze the transcript and choose 2 segments.
        </think>
        ```json
        [
          {
            "short_number": 1,
            "title": "Axiom 1",
            "key_concept": "Basic Law",
            "important_terms": ["Law", "Axiom"],
            "start_time": 10.0,
            "end_time": 60.0,
            "reason": "Foundational principle"
          }
        ]
        ```
        """
        cleaned = clean_json_response(raw_with_think)
        parsed = json.loads(cleaned)
        self.assertIsInstance(parsed, list)
        self.assertEqual(len(parsed), 1)
        self.assertEqual(parsed[0]["title"], "Axiom 1")

    def test_sanitize_segments_bounds_and_durations(self):
        raw_segments = [
            {
                "short_number": 1,
                "title": "Quick Flash",
                "key_concept": "Concept A",
                "important_terms": "term1, term2",
                "start_time": 5.0,
                "end_time": 8.0,  # Only 3s -> Should be lengthened
                "reason": "Test"
            },
            {
                "short_number": 2,
                "title": "Very Long",
                "key_concept": "Concept B",
                "important_terms": ["term3"],
                "start_time": 100.0,
                "end_time": 400.0,  # 300s -> Should be capped
                "reason": "Test 2"
            }
        ]
        sanitized = sanitize_segments(raw_segments, max_duration=500.0)
        self.assertEqual(len(sanitized), 2)
        # Verify term parsing from comma separated string
        self.assertEqual(sanitized[0]["important_terms"], ["term1", "term2"])
        # Verify min duration enforced
        dur1 = sanitized[0]["end_time"] - sanitized[0]["start_time"]
        self.assertGreaterEqual(dur1, 15.0)
        # Verify max duration capped
        dur2 = sanitized[1]["end_time"] - sanitized[1]["start_time"]
        self.assertLessEqual(dur2, 120.0)

    def test_fallback_segment_selection(self):
        transcript = {
            "segments": [
                {"start": 0.0, "end": 60.0, "text": "Introduction to algorithms and data structures."},
                {"start": 60.0, "end": 120.0, "text": "Big O notation and time complexity."},
                {"start": 120.0, "end": 180.0, "text": "Array traversal and binary search implementation."},
                {"start": 180.0, "end": 240.0, "text": "Summary and conclusions of the lecture."}
            ]
        }
        fallback_shorts = select_fallback_segments(transcript)
        self.assertGreaterEqual(len(fallback_shorts), 2)
        for s in fallback_shorts:
            self.assertIn("start_time", s)
            self.assertIn("end_time", s)
            self.assertIn("title", s)
            self.assertGreater(s["end_time"], s["start_time"])


if __name__ == "__main__":
    unittest.main()
