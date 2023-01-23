var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from "axios";
const BOOKSURL = "https://www.googleapis.com/books/v1/volumes?";
const apiKey = process.env.booksAPIKey;
export const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(event);
    let exampleTxt = "red rising";
    let completeURL = BOOKSURL + "q=" + exampleTxt + "&key=" + apiKey;
    const booksResponse = yield axios.get(completeURL);
    console.log(booksResponse.data);
    return buildResponse(200, "Book added to list!");
});
function buildResponse(status, body) {
    let sendHeaders = {
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
