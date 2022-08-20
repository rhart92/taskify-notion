import type { NextApiRequest, NextApiResponse } from "next"

// Pull from SDK
type NotionUserResponse = {
	type: "user"
	user: {
		object: "user"
		id: string
		name: string
		avatar_url: string | null
		type: "person"
		person: {
			email: string
		}
	}
}

type NotionTokenResponse = {
	access_token: string
	token_type: "bearer"
	bot_id: string
	workspace_name: string
	workspace_icon: string
	workspace_id: string
	owner: NotionUserResponse
}

// Exchange client ID and secret + auth code from user login for long living
// token that can be used to make requests just like an internal integration.
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<any[]>
) {
	// Path params are moved to query params by Next JS internals 🤔
	const { code } = req.query

	if (!code || Array.isArray(code)) {
		console.log("Invalid code.")
		return
	}

	const headers = new Headers()
	const OAUTH_CLIENT_ID = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID
	const OAUTH_CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET
	const credentials = `${OAUTH_CLIENT_ID}:${OAUTH_CLIENT_SECRET}`
	console.log(JSON.stringify(credentials))
	const basicAuth = `Basic ${Buffer.from(credentials).toString("base64")}`
	headers.append("Authorization", basicAuth)
	headers.append("Content-Type", "application/json")

	const resp = await fetch(`https://api.notion.com/v1/oauth/token`, {
		method: "post",
		headers,
		body: JSON.stringify({
			code,
			grant_type: "authorization_code",
		}),
	})

	const tokenResponse: NotionTokenResponse = await resp.json()

	console.log(tokenResponse)

	const searchResponse = await notionSearch(tokenResponse.access_token)

	console.log(searchResponse)

	res.status(200).json(searchResponse["results"])

}

async function notionSearch(token: string) {
	const headers = new Headers()
	const bearerAuth = `Bearer ${token}`
	headers.append("Authorization", bearerAuth)
	headers.append("Content-Type", "application/json")
	headers.append("notion-version", "2022-02-22")

	const resp = await fetch(`https://api.notion.com/v1/search`, {
		method: "post",
		headers,
		body: JSON.stringify({}),
	})

	return resp.json()
}
