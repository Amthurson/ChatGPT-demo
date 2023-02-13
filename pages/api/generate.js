import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// export default async function (req, res) {
//   const completion = await openai.createCompletion({
//     model: "text-davinci-002",
//     prompt: generatePrompt(req.body.animal),
//     temperature: 0.6,
//   });
//   res.status(200).json({ result: completion.data.choices[0].text });
// }

// 一个key, text-davinci-002 一个 Completion 最多只有 4096

// const reqBody = {
//   headers: {
//     'Content-Type': 'application/json',
//     'User-Agent': 'OpenAI/NodeJS/3.0.0',
//     'Authorization': 'Bearer APP_KEY'
//   },
//   method: 'POST',
//   apiKey: process.env.OPENAI_API_KEY,
//   model: "text-davinci-002",
//   prompt: req.body.prompt,
//   temperature: req.body?.temperature || 0.5,
//   stop: "*end*",// 截止符号
//   echo: true, //Echo back the prompt in addition to the completion
//   n: 1, // How many completions to generate for each prompt.
//   user: "Anderson" //A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse
// }

export default async function (req,res) {
  const completion = await openai.createCompletion({
    model: "text-davinci-002",
    prompt: req.body.prompt,
    temperature: req.body?.temperature || 0.5,
    stop: "*end*",// 截止符号
    echo: false, //Echo back the prompt in addition to the completion
    n: 1, // How many completions to generate for each prompt.
    user: "Anderson" //A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse
  });
  console.log({completion},'--completion')
  res.status(200).json({result: completion.data});
}

function generatePrompt(animal) {
  const capitalizedAnimal =
    animal[0].toUpperCase() + animal.slice(1).toLowerCase();
    console.log(capitalizedAnimal)
  return `Suggest three names for an animal that is a superhero.
  Animal: Cat
  Names: Captain Sharpclaw, Agent Fluffball, The Incredible Feline
  Animal: Dog
  Names: Ruff the Protector, Wonder Canine, Sir Barks-a-Lot
  Animal: ${capitalizedAnimal}
  Names:`;
}
