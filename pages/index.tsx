import { NextPage } from "next"
import { useEffect, useState } from "react"

const Home: NextPage = () => {
	const [dbs, setDbs] = useState<any[]>([])

	useEffect(() => {
		console.log('use effect')
		const params = new URL(window.document.location.href).searchParams
		// When Notion OAuth redirects you to `localhost:3000`, it will add a `code`
		// param to the URL (e.g. `localhost:3000?code="..."&state="..."`). State is
		// just a mirror of what we provide as state to get the user back to where
		// they were.
		const code = params.get("code")
		const rawState = params.get("state")

		const state = JSON.parse(rawState || "{}")

		const abortController = new AbortController()

		if (!code) return
		fetch(`/api/login/${code}`, { signal: abortController.signal }).then(
			async res => {
				setDbs(await res.json())
			}
		)

		// Handle the double mount
		return () => {
			console.log('cancelling request')
			abortController.abort()
		}
	}, [])

	const state = { page: "home" }

	return (
		<div>
			<a
				style={{ display: "block" }}
				href={`https://api.notion.com/v1/oauth/authorize?client_id=${
					process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID
				}&response_type=code&owner=user&state=${JSON.stringify(state)}`}
			>
				Connect to Notion
			</a>
			{dbs.map(db => (
				<div
					style={{
						display: "inline-flex",
						whiteSpace: "pre",
						border: "1px solid black",
						marginBottom: 10,
					}}
					key={db.id}
				>
					{JSON.stringify(db, null, 2)}
				</div>
			))}
		</div>
	)
}

export default Home
