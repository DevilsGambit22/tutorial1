# ACFA Sidebar Academy — Advanced Sidebar Example

A polished GitHub Pages sidebar demonstrating responsive HTML, CSS animations, JavaScript-driven data, a monthly calendar, a configurable member board, a progress bar, an advanced feature showcase, a rotating code-tip widget, saved visual themes, and an MP3 radio.

## Quick setup

1. Upload all files to a new GitHub repository.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and `/ (root)`, then save.
5. GitHub will provide a Pages URL such as `https://USERNAME.github.io/REPOSITORY/`.
6. Embed that URL in Chess.com using an iframe.

## Chess.com embed

```html
<div style="width:100%;max-width:760px;margin:0 auto;">
  <iframe
    src="YOUR-GITHUB-PAGES-URL"
    title="ACFA Sidebar Academy"
    width="100%"
    height="1800"
    scrolling="yes"
    loading="lazy"
    allow="autoplay"
    style="display:block;width:100%;height:1800px;border:0;border-radius:16px;overflow:auto;">
  </iframe>
</div>
```

## Edit members, goal, and calendar events

Open `config.js`.

- `memberCount`: current total, currently 16.
- `memberGoal`: target total, currently 100.
- `newestMembers`: manually editable usernames.
- `events`: calendar entries in `YYYY-MM-DD` format.

## Add radio tracks

1. Upload `.mp3` files into `assets/music/`.
2. Commit the files to GitHub.
3. The included GitHub Actions workflow regenerates `music/tracks.json`.
4. Refresh the hosted sidebar after the workflow completes.

GitHub Actions must have permission to write to the repository. Under **Settings → Actions → General → Workflow permissions**, select **Read and write permissions**.

## Advanced showcase and Code of the Day

The project includes a live feature showcase, rotating code tips controlled from `config.js`, and three saved visual themes. The selected theme is stored in the visitor’s browser with local storage.



## Live newest members

The member board now requests:

`https://api.chess.com/pub/club/and-chess-for-all-sidebar-academy/members`

The page combines the API membership groups, removes duplicate usernames, sorts members by their `joined` timestamp, displays the newest members, and uses the returned membership total for the 0–100 progress bar.

Change `clubSlug` in `config.js` if the Chess.com club URL changes. The fallback count and usernames are only displayed when the API cannot be reached.
