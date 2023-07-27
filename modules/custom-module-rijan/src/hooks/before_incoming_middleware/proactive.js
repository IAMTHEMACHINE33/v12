//asdasd
const fetchData = async () =>
{
  bp.logger.info("aaddd");
  const knex = bp.database
  try
  {
    const data = await knex.raw(
      `SELECT JSON_EXTRACT(payload, '$.type') AS type FROM "msg_messages" WHERE "conversationId" = '${event.threadId}' AND JSON_EXTRACT(payload, '$.type') != 'session_reset' AND
        JSON_EXTRACT(payload, '$.type') != 'visit'`
    )
    try
    {
      // const result = await this.props.bp.axios.get('mod/custom-module-rijan/random')

      // const axiosConfig = await bp.http.getAxiosConfigForBot(event.botId)
      // const asd = await axios.get(`/mod/custom-module-rijan/random`, axiosConfig)
      // bp.logger.info("result", result);
    }
    catch (error)
    {
      bp.logger.info(error);
    }
    return data
  } catch (error)
  {
    bp.logger.info(error)
  }
}

bp.logger.info('Event type', event.type)
if (event.type === 'proactive-trigger' || event.type === 'visit')
{

  const data = fetchData().then(data =>
  {
    bp.logger.info('length:', data.length)
    if (!data.length)
    {
      let greetingMessage = ''

      let currentTime = new Date().getHours()

      bp.logger.info('before')
      if (currentTime < 12)
      {
        greetingMessage = 'Good morning!'
        bp.logger.info('Good morning!')
      } else
      {
        greetingMessage = 'Good afternoon!'
        bp.logger.info('Good afternoon!')
      }

      try
      {
        const message = {
          type: 'text',
          text: greetingMessage,
          markdown: true
        }

        return bp.events.replyToEvent(event, [message])

      } catch (error)
      {
        bp.logger.info(error)
      }
    } else
    {
      bp.logger.info('else')
      if (event.type === 'proactive-trigger')
      {
        bp.logger.info('kei nagarne')
        // Skip event processing
        // event.setFlag(bp.IO.WellKnownFlags.SKIP_DIALOG_ENGINE, true)
      }
    }
  })
}
