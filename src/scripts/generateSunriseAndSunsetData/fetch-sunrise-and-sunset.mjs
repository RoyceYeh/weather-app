import { saveFile, readJSONFile, getDirName } from './utils.mjs'

async function processData(rawData) {
  if (!rawData || !rawData.cwaopendata || !rawData.cwaopendata.dataset || !rawData.cwaopendata.dataset.location) {
    throw new Error('Invalid data format. Missing expected properties.')
  }

  const locations = rawData.cwaopendata.dataset.location

  const nowTimeStamp = new Date().getTime() - 24 * 60 * 60 * 1000 // 取得前一天的時間戳記
  const data = locations.map((location) => {
    const time = location.time
      .filter((time) => new Date(time.Date).getTime() >= nowTimeStamp)
      .map((time) => {
        return {
          dataTime: time.Date,
          sunrise: time.SunRiseTime,
          sunset: time.SunSetTime,
        }
      })

    return {
      locationName: location.CountyName,
      time,
    }
  })

  return data
}

async function main() {
  try {
    const __dirname = getDirName()

    // 載入從中央氣象局下載的日出日落檔 A-B0062-001
    const rawData = await readJSONFile({
      filePath: `${__dirname}/A-B0062-001.json`,
    })

    if (!rawData) {
      throw new Error('Failed to read JSON file or empty data.')
    }

    const data = await processData(rawData)

    await saveFile({
      filePath: `${__dirname}/../../utils/sunrise-sunset.json`,
      data,
    })

    console.log('Successfully generate sunrise-sunset.json')
  } catch (error) {
    console.error('[filter-sunrise-and-sunset] error', error)
  }
}

export default main
