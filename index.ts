import {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import axios from "axios";
import { Octokit } from "@octokit/rest";

type Book = {
  title: string;
  author: string;
  publisher: string;
  notes: string;
};

const booksURL = "https://www.googleapis.com/books/v1/volumes?";
const booksAPIKey = process.env.booksAPIKey as string;
const githubAPIToken = process.env.githubAPIToken as string;
const gistID = process.env.gistID as string;

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  console.log(event);
  let exampleTxt = "red rising";
  let exampleNotes = "great one";
  let completeURL = booksURL + "q=" + exampleTxt + "&key=" + booksAPIKey;

  const book = await getBookInformation(completeURL, exampleNotes);

  const updateResonse = await updateGist(githubAPIToken, gistID, book);

  return buildResponse(200, updateResonse);
};

async function getBookInformation(url: string, notes: string): Promise<Book> {
  let booksResponse: any;
  try {
    booksResponse = await axios.get(url);
  } catch (error) {
    console.error(`Unable to access Google Books API:\n${error}`);
  }

  const bookData = booksResponse.data.items[0].volumeInfo;
  const title = bookData.title;
  const author = bookData.authors[0];
  const publisher = bookData.publisher;

  return {
    title: title,
    author: author,
    publisher: publisher,
    notes: notes,
  } as Book;
}

async function updateGist(
  githubAPIToken: string,
  gistID: string,
  book: Book
): Promise<string> {
  const octokit = new Octokit({
    auth: `token ${githubAPIToken}`,
  });

  let gist: any;
  try {
    gist = await octokit.gists.get({ gist_id: gistID });
  } catch (error) {
    console.error(`Unable to get gist:\n${error}`);
  }

  // There should be just a single file
  const filename = Object.keys(gist.data.files)[0];
  const fileContent = gist.data.files[filename].content;
  const newContentLine =
    "\n| " +
    book.title +
    " | " +
    book.author +
    " | " +
    book.publisher +
    " | " +
    book.notes +
    " |";

  try {
    await octokit.gists.update({
      gist_id: gistID,
      files: {
        [filename]: {
          content: fileContent + newContentLine,
        },
      },
    });
  } catch (error) {
    console.error(`Unable to update gist:\n${error}`);
  }

  return "Book added successfully!";
}

function buildResponse(
  status: number,
  body: string
): APIGatewayProxyStructuredResultV2 {
  let sendHeaders: { [key: string]: string } = {
    "content-type": "application/json",
  };

  const response = {
    isBase64Encoded: false,
    statusCode: status,
    headers: sendHeaders,
    body: body,
  };

  return response;
}
