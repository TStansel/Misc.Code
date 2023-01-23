import {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import axios from "axios";

type Book = {
    title: string;
    author: string;
    publisher: string;
    notes: string;
  };

const BOOKSURL = "https://www.googleapis.com/books/v1/volumes?";
const apiKey = process.env.booksAPIKey as string;

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  console.log(event);
  let exampleTxt = "red rising";
  let exampleNotes = "great one";
  let completeURL = BOOKSURL + "q=" + exampleTxt + "&key=" + apiKey;

  const book = getBookInformation(completeURL, exampleNotes);

  return buildResponse(200, "Book added to list!");
};

async function getBookInformation(url: string, notes: string): Promise<Book> {
  // TODO: Add try catch and error handling for axios call
  const booksResponse = await axios.get(url);

  const bookData = booksResponse.data.volumeInfo;
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
