import {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import axios from "axios";

const BOOKSURL = "https://www.googleapis.com/books/v1/volumes?";
const apiKey = process.env.booksAPIKey as string;

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  console.log(event);
  let exampleTxt = "red rising";

  let completeURL = BOOKSURL + "q=" + exampleTxt + "&key=" + apiKey;
  const booksResponse = await axios.get(completeURL);

  console.log(booksResponse.data);

  return buildResponse(200, "Book added to list!");
};

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
  console.log(response);
  return response;
}
