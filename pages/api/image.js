import * as openai from "openai";

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);

// create Image
export const createImage = async (options) => {
  const respone = await openai.createCompletion(options);
  return respone.data.data[0].url
}

// create template text
export default async function (req, res) {
  const completion = await createImage(req.body);
  res.status(200).json({ result: completion });
}