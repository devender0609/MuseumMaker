export default async function handler(req, res) {
  res.status(200).json({ ok: true, message: 'StudentStory runs locally first. Add AI generation later only after the evidence workflow is validated.' });
}
