import * as sdk from 'botpress/sdk'
import uploadConfig from './upload'

export default async (bp: typeof sdk) => {
  /**
   * This is an example route to get you started.
   * Your API will be available at `http://localhost:3000/api/v1/bots/BOT_NAME/mod/custom-module-rijan`
   * Just replace BOT_NAME by your bot ID
   */
  const router = bp.http.createRouterForBot('custom-module-rijan')

  // Link to access this route: http://localhost:3000/api/v1/bots/BOT_NAME/mod/custom-module-rijan/my-first-route
  router.get('/my-first-route', async (req, res) => {
    // Since the bot ID is required to access your module,
    const botId = req.params.botId

    /**
     * This is how you would get your module configuration for a specific bot.
     * If there is no configuration for the bot, global config will be used. Check `config.ts` to set your configurations
     */
    const config = await bp.config.getModuleConfigForBot('custom-module-rijan', botId)

    res.sendStatus(200)
  })
  router.get('/title', async (req, res) => {
    res.send({ message: 'Change xlsx to Json' })
  })
  router.get('/random', async (req, res) => {
    res.send({ message: 'random' })
  })
  router.get('/config', async (req, res) => {
    const botpressConfig = await bp.config.getBotpressConfig()
    // console.log(botpressConfig.fileUpload)
    res.send({ allowedMimeTypes: botpressConfig.fileUpload.allowedMimeTypes })
  })
  const botpressConfig = await bp.config.getBotpressConfig()
  const upload = uploadConfig(botpressConfig.fileUpload.allowedMimeTypes)

  router.post('/upload', upload.single('file'), async (req, res) => {
    if (req.body.fileValidationError) {
      res.send({ message: req.body.fileValidationError })
    } else {
      res.send({ message: 'Done Boiii', data: req.file?.filename })
    }
  })
}
