import express from 'express'
import cors from 'cors'
import { json } from 'body-parser'
import axios from 'axios'
import fs from 'fs'
const TT_BASE = 'https://www.tinytap.com'
const STORE_BASE = `${TT_BASE}/store/api`
const MARKET_BASE = `${STORE_BASE}/market`
const FEATURED_GAMES_BASE = `${STORE_BASE}/content/featured`
const SEARCH_BASE = `${STORE_BASE}/content/search`
const TINYTAP_AI_BASE = `${TT_BASE}/ai`
const TINYTAP_AI_GAME_BASE = `${TINYTAP_AI_BASE}/game`
const TINYTAP_LANGCHAIN_BASE = `https://langchain.tinytap.com`
const TINYTAP_LANGCHAIN_COURSE_BASE = `${TINYTAP_LANGCHAIN_BASE}/course`
const TINYTAP_LANGCHAIN_GAME_BASE = `${TINYTAP_LANGCHAIN_BASE}/game`
const TINYTAP_LANGCHAIN_COVER_IMAGE_BASE = `${TINYTAP_LANGCHAIN_BASE}/cover_image`

const app = express()
const PORT = process.env.PORT || 5003 || 8080
app.use(
  cors({
    origin: 'https://chat.openai.com',
  })
)
app.use(json())
app.get('/', (req, res) => {
  console.log('GET /')
  res.status(200).send(`I'm Alive`)
})
app.get('/hello/:name', (req, res) => {
  const name = req.params.name
  console.log(`GET /hello/${name}`)
  res.status(200).send(`Hello ${name}! How are you?`)
})

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
const allowed_collections = [] as string[]
const parseCollectionsData = (collections: any[], list?: string) => {
  let collections_list = null as any
  if (list?.length) {
    collections_list = list.split(',')
  }
  let filteredCollections = null

  if (collections_list?.length) {
    filteredCollections = collections.filter((collection: any) => {
      let isValid = false
      for (let i = 0; i < collections_list.length; i++) {
        const valid = collection.title.includes(collections_list[i])
        if (valid) {
          isValid = true
          break
        }
      }
      return isValid
    })
  } else {
    filteredCollections = collections
  }
  const sortedCollections = filteredCollections.sort((a, b) => a.order - b.order)
  const fixedCollections = sortedCollections.map((collection) => {
    const { id, title, content, url, path, order } = collection
    allowed_collections.push(title)
    const games = content
      .filter((game: any) => game.modelName === 'AlbumStore')
      .map((game: any) => {
        const {
          id,
          likes_count,
          play_count,
          album: { fields },
        } = game

        const { name, age_group_text, description, link, cover_image, languages } = fields

        const response = {
          id: id,
          title: name,
          description: description,
          age_group: age_group_text,
          language: languages[0].title,
          play_count: play_count,
          likes_count: likes_count,
          image: cover_image,
          url: link,
        }
        console.log('parseCollectionsData', { response })
        return response
      })
    return {
      id: id,
      order: order,
      title: title,
      endpoint: url,
      url: `${TT_BASE}${path}`,
      games: games,
    }
  })

  return {
    title: 'TinyTap Collections',
    description: 'TinyTap Featured Collections description',
    collections: fixedCollections,
    allowed_collections: allowed_collections,
  }
}
const parseGamesData = (games: any[]) => {
  console.log('parseGamesData', { games })
  return {
    title: 'TinyTap Games',
    description: 'TinyTap Games description',
    games: games
      .filter((game) => game.modelName === 'AlbumStore')
      .map((game) => {
        const { name, description, link, cover_image } = game.album.fields
        return {
          id: game.id,
          title: name,
          description: description,
          url: link,
          image: cover_image,
        }
      }),
  }
}

const collectionsResponse = async (url: string, list?: string) => {
  console.log('Generate Collections Response', { url })
  try {
    const response = await axios.get(url)
    return parseCollectionsData(response.data.data, list)
  } catch (error) {
    console.error('Error fetching collections:', error)
    throw error
  }
}
const gameResponse = async (url: string) => {
  console.log('Generate Game Response', { url })
  try {
    const response = await axios.get(url)
    return parseGamesData(response.data.data)
  } catch (error) {
    //console.error('Error fetching games:', error)
    throw error
  }
}
app.get('/tinytap-featured-games', async (_, res) => {
  const fixedUrl = `${FEATURED_GAMES_BASE}`
  console.log('GET /tinytap-featured-games', { fixedUrl })
  try {
    const gamesHtml = await gameResponse(fixedUrl)
    res.json(gamesHtml)
  } catch (error) {
    res.status(500).send('Error fetching featured games')
  }
})
app.get('/tinytap-games/:query', async (req, res) => {
  const { query } = req.params
  const fixedUrl = `${SEARCH_BASE}/${query}?language=all&ageGroup=all&include_courses=0&ver=3.5&page_num=1&per_page=20`
  console.log('GET /tinytap-games/:query', { query, fixedUrl })
  try {
    const gamesHtml = await gameResponse(fixedUrl)
    res.json(gamesHtml)
  } catch (error) {
    res.status(500).send(`Error fetching games for query: ${query}`)
  }
})

app.get('/tinytap-games/:query/:page/:count', async (req, res) => {
  const { query, page, count } = req.params
  const fixedUrl = `${SEARCH_BASE}/${query}?language=all&ageGroup=all&include_courses=0&ver=3.5&page_num=${page}&per_page=${count}`
  console.log('GET /tinytap-games/:query/:page/:count', { query, page, count, fixedUrl })
  try {
    const gamesHtml = await gameResponse(fixedUrl)
    res.json(gamesHtml)
  } catch (error) {
    res.status(500).send(`Error fetching games for query: ${query} and page: ${page}`)
  }
})

app.get('/tinytap-games/:query/:language/:age/:page/:count', async (req, res) => {
  const { query, language, age, page, count } = req.params
  const fixedAge = getAgeValue(age)
  const fixedLanguage = getLanguageValue(language)
  const url = `${SEARCH_BASE}/${query}?language=${fixedLanguage}&ageGroup=${fixedAge}&include_courses=0&ver=3.5&page_num=${page}&per_page=${count}`
  console.log('GET /tinytap-games/:query/:language/:age/:page/:count', { query, language, age, page, count, url })
  try {
    const gamesHtml = await gameResponse(url)
    res.json(gamesHtml)
  } catch (error) {
    res.status(500).send(`Error fetching games for query: ${query} language: ${language} age:${age} and page: ${page}`)
  }
})
app.get('/tinytap-collections/:language/:age/', async (req, res) => {
  const { language = 'all', age = 'all' } = req.params
  const fixedAge = getAgeValue(age)
  const fixedLanguage = getLanguageValue(language)
  const url = `${MARKET_BASE}/?language=${fixedLanguage}&ageGroup=${fixedAge}&include_courses=0`
  console.log('GET /tinytap-games/market/:language/:age', { language, age, url })
  try {
    const gamesHtml = await collectionsResponse(url)
    res.json(gamesHtml)
  } catch (error) {
    res.status(500).send(`Error fetching collections for language: ${language} and age: ${age}`)
  }
})
app.get('/tinytap-collections/:language/:age/:collections', async (req, res) => {
  const { language = 'all', age = 'all', collections = `Editors' Picks,New on TinyTap` } = req.params
  const fixedAge = getAgeValue(age)
  const fixedLanguage = getLanguageValue(language)
  const url = `${MARKET_BASE}/?language=${fixedLanguage}&ageGroup=${fixedAge}&include_courses=0`
  console.log('GET /tinytap-games/market/:language/:age', { language, age, url })
  try {
    const gamesHtml = await collectionsResponse(url, collections)
    res.json(gamesHtml)
  } catch (error) {
    res.status(500).send(`Error fetching games for language: ${language} and age: ${age}`)
  }
})
app.get('/tinytap-ai-game/:term', async (req, res) => {
  const { term } = req.params
  const courseUrl = `${TINYTAP_LANGCHAIN_COURSE_BASE}/?term=${term}`

  try {
    const courseResponse = await axios.get(courseUrl)
    const units = courseResponse.data.units

    if (units && units.length > 0 && units[0].status === 5) {
      // Fetch game details
      const gameDetailsUrl = `${TINYTAP_LANGCHAIN_GAME_BASE}/?term=${term}&unit_id=0`
      const gameDetailsResponse = await axios.get(gameDetailsUrl)
      const gameDetails = gameDetailsResponse.data.ai_game

      // Fetch cover image
      const coverImageUrl = `${TINYTAP_LANGCHAIN_COVER_IMAGE_BASE}/?term=${term}`
      const coverImageResponse = await axios.get(coverImageUrl)
      const coverImage = coverImageResponse.data
      const game = {
        cover_image: coverImage,
        sections: gameDetails.sections,
        title: gameDetails.title,
        language: gameDetails.language_name,
      }
      // Construct and send response
      const response = {
        ready: true,
        url: `${TINYTAP_AI_GAME_BASE}/${term}`,
        term: term,
        unit_id: 0,
        game: game,
        related_terms: gameDetails.related,
        status: units[0].status,
      }
      console.log(`/tinytap-ai-game/${term}`, { response })
      res.json(response)
    } else if (units && units.length > 0 && units[0].status === 0) {
      // Initialize game creation
      await axios.get(`${TINYTAP_LANGCHAIN_GAME_BASE}/?term=${term}&unit_id=0`)

      // Construct and send response
      const response = {
        ready: false,
        url: `${TINYTAP_AI_GAME_BASE}/${term}`,
        term: term,
        unit_id: 0,
        status: units[0].status,
      }
      console.log(`/tinytap-ai-game/${term}`, { response })
      res.json(response)
    } else {
      // Game is not ready yet
      const response = {
        ready: false,
        url: `${TINYTAP_AI_GAME_BASE}/${term}`,
        term: term,
        unit_id: 0,
        status: units[0].status,
      }
      console.log(`/tinytap-ai-game/${term}`, { response })
      res.json(response)
    }
  } catch (error) {
    console.error('Error in /tinytap-games/tinytap-ai/:query:', error)
    res.status(500).send('Error fetching ai game response')
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

