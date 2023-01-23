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
import { Octokit } from "@octokit/rest";
const booksURL = "https://www.googleapis.com/books/v1/volumes?";
const booksAPIKey = process.env.booksAPIKey;
const githubAPIToken = process.env.githubAPIToken;
const gistID = process.env.gistID;
export const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    let eventAny = event;
    let title = eventAny.title;
    let notes = eventAny.notes;
    if (title == "") {
        return buildResponse(400, "Title can not be empty.");
    }
    if (notes.toLowerCase() === "no" || notes.toLowerCase() === "nope") {
        notes = "";
    }
    let completeURL = booksURL + "q=" + title + "&key=" + booksAPIKey;
    const book = yield getBookInformation(completeURL, notes);
    const updateResonse = yield updateGist(githubAPIToken, gistID, book);
    return buildResponse(200, updateResonse);
});
function getBookInformation(url, notes) {
    return __awaiter(this, void 0, void 0, function* () {
        let booksResponse;
        try {
            booksResponse = yield axios.get(url);
        }
        catch (error) {
            console.error(`Unable to access Google Books API:\n${error}`);
        }
        const bookData = booksResponse.data.items[0].volumeInfo;
        const title = bookData.title;
        const author = bookData.authors[0];
        return {
            title: title,
            author: author,
            notes: notes,
        };
    });
}
function updateGist(githubAPIToken, gistID, book) {
    return __awaiter(this, void 0, void 0, function* () {
        const octokit = new Octokit({
            auth: `token ${githubAPIToken}`,
        });
        let gist;
        try {
            gist = yield octokit.gists.get({ gist_id: gistID });
        }
        catch (error) {
            console.error(`Unable to get gist:\n${error}`);
        }
        // There should be just a single file
        const filename = Object.keys(gist.data.files)[0];
        const fileContent = gist.data.files[filename].content;
        const newContentLine = "\n| " + book.title + " | " + book.author + " | " + book.notes + " |";
        try {
            yield octokit.gists.update({
                gist_id: gistID,
                files: {
                    [filename]: {
                        content: fileContent + newContentLine,
                    },
                },
            });
        }
        catch (error) {
            console.error(`Unable to update gist:\n${error}`);
        }
        return "Book added successfully!";
    });
}
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
    return response;
}
