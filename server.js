import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'

import topMusicData from './data/top-music.json'

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/project-mongo"
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise

const musicTrackSchema = new mongoose.Schema({
  id: Number,
  trackName: {
    type: String,
    lowercase: true
  },
  artistName: {
    type: String,
    lowercase: true
  },
  genre: {
    type: String,
    lowercase: true
  },
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
  res.send('Popular Music API')
})

//OK
//all tracks, all info + query trackname
app.get('/tracks', async (req, res) => {
  const { trackname } = req.query

  try {
    if (trackname) {
      const tracks = await MusicTrack.find({
        trackName: {
        $regex: new RegExp(trackname, 'i') 
        }
      })
      res.json({ data: tracks })
    } else {
      const tracks = await MusicTrack.find()
      res.json({ length: tracks.length, data: tracks })
    } 
  } catch (error) {
    res.status(404).json({ error: `Something went wrong`, details: error })
  }

})

//OK
//sorts all tracks based on popularity
app.get('/tracks/popularity', async (req, res) => {

  try {
    let tracks = await MusicTrack.find() 
    tracks = tracks.sort((a, b) => b.popularity - a.popularity)
    res.json({ length: tracks.length, data: tracks })
  } catch (error) {
    res.status(404).json({ error: `Something went wrong`, details: error })
  }

})

//OK
//one track, by ID
app.get('/tracks/:trackId', async (req, res) => {
  const { trackId } = req.params

  try {
    const track = await MusicTrack.findById(trackId)
    res.json({ data: track })
  } catch (error) {
    res.status(400).json({ error: `Something went wrong`, details: error })
  }

})

//OK
//all artists - dictionary
app.get('/artists', async (req, res) => {

  try {
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
  } catch (error) {
    res.status(400).json({ error: `Something went wrong`, details: error })
  }

})

//OK
//get all tracks from one artist
app.get('/artists/artist/:artist', async (req, res) => {
  const { artist } = req.params

  try {
    if (artist) {
    const oneArtist = await MusicTrack.find({
      artistName: {
        $regex: new RegExp(artist, 'i') 
      }
    })
    res.json({ length: oneArtist.length, data: oneArtist })
    }
  } catch (error) {
    res.status(404).json({ error: `Something went wrong`, details: error })
  }

})

//OK
//all genres - dictionary
app.get('/genres', async (req, res) => {

  try {
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
  } catch (error) {
    res.status(404).json({ error: `Something went wrong`, details: error })
  }

})

//OK
//lists all artists for a specific genre
app.get('/genres/:genre/artists', async (req, res) => {
  const { genre } = req.params

  try {
    const artists = await MusicTrack.find({
      genre: {
        $regex: new RegExp(genre, 'i')
      }
    })
    res.json({ length: artists.length, data: artists })
  } catch (error) {
    res.status(404).json({ error: `Something went wrong`, details: error })
  }

})

// Start the server
app.listen(port, () => {
  // eslint-disable-next-line
  console.log(`Server running on http://localhost:${port}`)
})
