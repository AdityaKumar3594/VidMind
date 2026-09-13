import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
  timeout: 600000, // 10 minutes — pipeline can be slow for long videos
})

export async function processUrl(url, language = 'english') {
  const { data } = await client.post('/process/url', { url, language })
  return data
}

export async function processFile(file, language = 'english') {
  const form = new FormData()
  form.append('file', file)
  form.append('language', language)
  const { data } = await client.post('/process/file', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 600000,
  })
  return data
}

export async function chat(sessionId, question) {
  const { data } = await client.post('/chat', {
    session_id: sessionId,
    question,
  })
  return data.answer
}
