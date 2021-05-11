import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'

import topMusicData from './data/top-music.json'

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/project-mongo"
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise

const musicTrackSchema = new mongoose.Schema({
  id: Number,
  trackName: String,
  artistName: String,
  genre: String,
  bpm: Number,
  energy: Number,
  danceability: Number,
  loudness: Number,
  liveness: Number,
  valence: Number,
  length: Number,
  acousticness: Number,
  speechiness: Number,
  popularity: Number
})

const MusicTrack = mongoose.model('MusicTrack', musicTrackSchema)

if(process.env.RESET_DB) {
  const seedDB = async () => {
    await MusicTrack.deleteMany()

    await topMusicData.forEach(item => {
      const NewMusicTrack = new MusicTrack(item)
      NewMusicTrack.save()
    })
  }
  seedDB()
}

const port = process.env.PORT || 8080
const app = express()

app.use(cors())
app.use(express.json())


//OK
// Start defining your routes here
app.get('/', (req, res) => {
  res.send('Music API')
})

//OK
//all tracks, all info
app.get('/tracks', async (req, res) => {
  const tracks = await MusicTrack.find()
  res.json({ length: tracks.length, data: tracks })
})

//OK
//one track, by ID
app.get('/tracks/:id', async (req, res) => {
  const track = await MusicTrack.findById(req.params.id)
    res.json({ data: track })
})

//NOT OK
app.get('/tracks/popularity', async (req, res) => {
  let tracks = await MusicTrack.find() 
  tracks = tracks.sort((a, b) => b.popularity - a.popularity)
  res.json({ data: tracks })
})

//OK
//all artists - dictionary
app.get('/artists', async (req, res) => {
  const tracks = await MusicTrack.find()
  let artistsDuplicated = tracks
    .map(item => item.artistName)
  
  let artistsUnique = []
  artistsDuplicated.forEach(item => {
    if(!artistsUnique.includes(item)) {
      artistsUnique.push(item)
    }
  })
  res.json({ length: artistsUnique.length, data: artistsUnique })
})

//OK BUT needs to fix .toLowerCase and .replace
//get all tracks from one artist
app.get('/artists/:artist', async (req, res) => {
  await MusicTrack.find({ artistName: req.params.artist }).then(artist => {
    if (artist) {
      res.json({ length: artist.length, data: artist })
    }
  })
//.filter(item => item.artistName.toLowerCase().replace(/\s/g, '').includes(artist.toLowerCase().replace(/\s/g, ''))
})

//OK
//all genres - dictionary
app.get('/genres', async (req, res) => {
  const tracks = await MusicTrack.find()
  let genresDuplicated = tracks
    .map(item => item.genre)

  let genresUnique = []
  genresDuplicated.forEach(item => {
    if(!genresUnique.includes(item)) {
      genresUnique.push(item)
    }
  })
  res.json({ length: genresUnique.length, data: genresUnique })
})

//OK BUT needs to fix .replace
//lists all artists for a specific genre
app.get('/genres/:genre/artists', async (req, res) => {
  await MusicTrack.find( { genre: req.params.genre }).then(artist => {
    if (artist) {
      res.json({ length: artist.length, data: artist })
    }
  })
})

// Start the server
app.listen(port, () => {
  // eslint-disable-next-line
  console.log(`Server running on http://localhost:${port}`)
})
