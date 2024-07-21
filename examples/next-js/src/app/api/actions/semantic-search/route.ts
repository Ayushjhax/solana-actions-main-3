import {
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  createPostResponse,
  ActionGetResponse,
  ActionPostRequest,
} from "@solana/actions";

import {
  Connection,
  PublicKey,
  clusterApiUrl,
} from "@solana/web3.js";

import {
  fetchWikipediaLinks,
  createTransaction,
} from './utility';

async function semanticSearch(query: string, resultsLang: string = '') {
  console.log(`Searching for "${query}" in language: ${resultsLang || 'All'}`);
  return [
    {
      title: "Sample Article",
      url: "https://example.com",
      text: "This is a sample article text.",
      views: 1000,
      lang: "en",
      _additional: { distance: 0.1 }
    }
  ];
}

// Server-side function to strip HTML tags
const stripHtmlTags = (html: string): string => {
  // Use an HTML parsing library for server-side environments
  const { parse } = require('node-html-parser');
  const root = parse(html);
  return root.textContent || "";
};

export const GET = async (req: Request): Promise<Response> => {
  try {
    const requestUrl = new URL(req.url);
    const baseHref = new URL("/api/actions/semantic-search", requestUrl.origin).toString();

    const payload: ActionGetResponse = {
      title: "Paid Multilingual Semantic Search",
      icon: new URL("/search_icon.jpg", requestUrl.origin).toString(),
      description: "Search for articles across multiple languages (costs 0.1 SEND)",
      label: "Search",
      links: {
        actions: [
          {
            label: "Search Articles",
            href: `${baseHref}?query={query}&language={language}`, // Use backticks
            parameters: [
              {
                name: "query",
                label: "Enter your search query",
                required: true,
              },
              {
                name: "language",
                label: "Select language",
                required: false,
              },
            ],
          },
        ],
      },
    };

    return new Response(JSON.stringify(payload), {
      headers: ACTIONS_CORS_HEADERS,
    });
  } catch (err) {
    console.error(err);
    let message = "An unknown error occurred";
    if (typeof err === "string") message = err;
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  }
};

export const OPTIONS = GET;

export const POST = async (req: Request): Promise<Response> => {
  try {
    const requestUrl = new URL(req.url);
    const query = requestUrl.searchParams.get("query") || "";
    const language = requestUrl.searchParams.get("language") || "";

    const body: ActionPostRequest = await req.json();

    // Validate the client provided input
    let account: PublicKey;
    try {
      account = new PublicKey(body.account);
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Invalid "account" provided' }), {
        status: 400,
        headers: ACTIONS_CORS_HEADERS,
      });
    }

    const connection = new Connection(clusterApiUrl("mainnet-beta"));
    const searchFee = 1_000_000; // 0.1 SEND (1_000_000 is 0.1 SEND in lamports)
    const transaction = await createTransaction(connection, account, searchFee);

    // Call the semantic search function
    const results = await semanticSearch(query, language);

    // Fetch Wikipedia links
    const wikiResults = await fetchWikipediaLinks(query);

    // Format the results into a string for display
    const formattedResults = results.map((result: any, index: number) =>
      `${index + 1}. ${result.title}: ${result.url}` // Use backticks
    ).join('\n');

    // Format the Wikipedia results into a string for display
    const formattedWikiResults = wikiResults.map((result: any, index: number) =>
      ` ${index + 1}. ${result.title}: ${result.url} - ${stripHtmlTags(result.snippet)}` // Strip HTML tags
    ).join('\n'); // Two newlines for separating entries

    // Testing output
    console.log("Formatted Wiki Results:\n", formattedWikiResults);

    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        transaction,
        message: `Found ${results.length} results for "${query}". Fee: 0.1 SEND\n\n${formattedResults}\n\nWikipedia Links:\n${formattedWikiResults}`, // Use backticks
      },
    });

    return new Response(JSON.stringify(payload), {
      headers: ACTIONS_CORS_HEADERS,
    });
  } catch (err) {
    console.error(err);
    let message = "An unknown error occurred";
    if (typeof err === "string") message = err;
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  }
};