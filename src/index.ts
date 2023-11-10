import express from 'express'
import cors from 'cors'
import { json } from 'body-parser'
import axios from 'axios'
import fs from 'fs'
const TT_BASE = 'https://www.tinytap.com'
const STORE_BASE = `${TT_BASE}/store/api`
const SEARCH_BASE = `${STORE_BASE}/content/search`
const app = express()
const PORT = process.env.PORT || 5003 || 8080
app.use(
  cors({
    origin: 'https://chat.openai.com',
  }),
)
app.use(json())
app.get('/', (req, res) => {
  res.status(200).send(`I'm Alive`)
})
app.get('/hello/:name', (req, res) => {
  const name = req.params.name
  res.status(200).send(`Hello ${name}! How are you?`)
})

const parseGamesData = (games: any[]) => {
  return {
    title: 'TinyTap Games',
    description: 'TinyTap Games description',
    games: games
      .filter((game) => game.modelName === 'AlbumStore')
      .map((game) => {
        const { name, description, link, cover_image } = game.album.fields
        return {
          title: name,
          description: description,
          url: link,
          image: cover_image,
        }
      }),
  }
}

const getAgeValue = (age: string | number) => {
  const validAges = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14']
  return validAges.includes(`${age}`) ? age : 'all'
}

const getLanguageValue = (language: string) => {
  const allLanguages = {
    all: 0,
    'en-us': 1,
    'en-gb': 52,
    'en-au': 53,
    ar: 24,
    bg: 28,
    ca: 34,
    'zh-cn': 11,
    'zh-hk': 60,
    hr: 48,
    cs: 20,
    da: 13,
    nl: 6,
    et: 39,
    ba: 32,
    tl: 33,
    fi: 26,
    'fr-fr': 4,
    'fr-ca': 61,
    gl: 50,
    ka: 63,
    de: 5,
    el: 17,
    he: 2,
    hi: 37,
    hu: 16,
    id: 12,
    it: 7,
    ja: 8,
    ko: 18,
    lv: 56,
    lt: 45,
    ms: 31,
    dv: 57,
    no: 27,
    fa: 21,
    pl: 25,
    pt: 9,
    pa: 62,
    ro: 19,
    ru: 10,
    sk: 29,
    sl: 58,
    es: 3,
    sw: 30,
    sv: 22,
    ta: 49,
    te: 46,
    th: 15,
    tr: 23,
    uk: 59,
    vi: 14,
    cy: 55,
  } as any
  return allLanguages[language] || allLanguages['all'] // If language is not found, default to 'all'
}

const gameResponse = async (url: string) => {
  try {
    const response = await axios.get(url)
    return parseGamesData(response.data.data)
  } catch (error) {
    console.error('Error fetching games:', error)
    throw error
  }
}

app.get('/tinytap-games/:query', async (req, res) => {
  const { query } = req.params
  const fixedUrl = `${SEARCH_BASE}/${query}?language=all&ageGroup=all&include_courses=0&ver=3.5&page_num=1&per_page=20`
  try {
    const gamesHtml = await gameResponse(fixedUrl)
    res.json(gamesHtml)
  } catch (error) {
    res.status(500).send('Error fetching games')
  }
})

app.get('/tinytap-games/:query/:page/:count', async (req, res) => {
  const { query, page, count } = req.params
  const fixedUrl = `${SEARCH_BASE}/${query}?language=all&ageGroup=all&include_courses=0&ver=3.5&page_num=${page}&per_page=${count}`

  try {
    const gamesHtml = await gameResponse(fixedUrl)
    res.json(gamesHtml)
  } catch (error) {
    res.status(500).send('Error fetching games')
  }
})

app.get('/tinytap-games/:query/:language/:age/:page/:count', async (req, res) => {
  const { query, language, age, page, count } = req.params
  const fixedAge = getAgeValue(age)
  const fixedLanguage = getLanguageValue(language)
  const url = `${SEARCH_BASE}/${query}?language=${fixedLanguage}&ageGroup=${fixedAge}&include_courses=0&ver=3.5&page_num=${page}&per_page=${count}`

  try {
    const gamesHtml = await gameResponse(url)
    res.json(gamesHtml)
  } catch (error) {
    res.status(500).send('Error fetching games')
  }
})

app.get('/logo.png', async (_, res) => {
  const filename = 'logo.png'
  res.sendFile(filename, { root: '.' })
})

app.get('/.well-known/ai-plugin.json', async (_, res) => {
  fs.readFile('./.well-known/ai-plugin.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err)
      res.status(500).send('Error')
      return
    }
    res.setHeader('Content-Type', 'application/json')
    res.status(200).send(data)
  })
})

app.get('/openapi.yaml', async (_, res) => {
  fs.readFile('openapi.yaml', 'utf8', (err, data) => {
    if (err) {
      console.error(err)
      res.status(500).send('Error')
      return
    }
    res.setHeader('Content-Type', 'text/yaml')
    res.status(200).send(data)
  })
})

const main = () => {
  app.listen(PORT as number, () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`)
  })
}

main()

