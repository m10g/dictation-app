const { EdgeTTS } = require("node-edge-tts");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

const SCRIPTS = [
  "It's Joe's first day at his new school, full stop.",
  "It's ten o'clock and the pupils are in the music room, full stop.",
  "They're playing the recorder, full stop.",
  "Joe thinks it is difficult to repeat after the teacher, full stop.",
  "Open quotation mark, Oh, comma, no, exclamation mark, close quotation mark, says Joe, full stop.",
  "Open quotation mark, I'm in the wrong class, full stop, close quotation mark.",
  "Joe and the other pupils laugh, full stop.",
  "Joe goes to his classroom, full stop."
];

const VOICE = "en-GB-SoniaNeural";

module.exports = async function handler(req, res) {
  const sentence = Number(req.query.sentence);
  const mode = req.query.mode === "slow" ? "slow" : "normal";

  if (!Number.isInteger(sentence) || sentence < 1 || sentence > 8) {
    res.status(400).json({ error: "sentence must be 1-8" });
    return;
  }

  const script = SCRIPTS[sentence - 1];
  const text = "Sentence " + sentence + ". " + script + " Again. " + script;
  const rate = mode === "slow" ? "-24%" : "-8%";
  const file = path.join(os.tmpdir(), "dictapet-" + sentence + "-" + mode + "-" + crypto.randomUUID() + ".mp3");

  try {
    const tts = new EdgeTTS({
      voice: VOICE,
      lang: "en-GB",
      outputFormat: "audio-24khz-96kbitrate-mono-mp3",
      rate,
      pitch: "default",
      volume: "default",
      timeout: 15000
    });

    await tts.ttsPromise(text, file);
    const audio = await fs.readFile(file);

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", String(audio.length));
    res.setHeader("Content-Disposition", 'inline; filename="partb-' + String(sentence).padStart(2,"0") + "-" + mode + '.mp3"');
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=604800");
    res.setHeader("CDN-Cache-Control", "public, s-maxage=31536000, stale-while-revalidate=604800");
    res.setHeader("Vercel-CDN-Cache-Control", "public, s-maxage=31536000, stale-while-revalidate=604800");
    res.status(200).send(audio);
  } catch (error) {
    console.error("dictation audio error", error);
    res.status(502).json({ error: "voice generation temporarily unavailable" });
  } finally {
    try { await fs.unlink(file); } catch (_) {}
  }
};
