import multer from 'multer'


import processAndInsertShortData from '#root/src/helpers/shortDataProcessor.js'


const now = new Date()

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, `${process.cwd()}/storage/`)
	},
	filename: (req, file, cb) => {
		cb(null,`short_data_${now}.csv`)
	}
})

const upload = multer({
	storage: storage
}).single('shortdata')

export default (req, res) => {
	upload(req, res, (err) => {
		console.log(req.file, req.body)

		processAndInsertShortData(req.file.path)
		res.send('Successful!')
	})
}