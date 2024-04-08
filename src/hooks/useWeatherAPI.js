import { useCallback, useEffect, useMemo, useState } from 'react'

const fetchCurrentWeather = ({ authorizationKey, stationName }) => {
  // setWeatherElement((prevState) => ({
  //   ...prevState,
  //   isLoading: true,
  // }))
  //留意這裡的return 直接把fetch api 回傳的promise再回傳回去
  return fetch(`https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=${authorizationKey}&StationName=${stationName}`)
    .then((res) => res.json())
    .then((data) => {
      const locationData = data.records.Station[0]
      // console.log(locationData)
      return {
        observationTime: locationData.ObsTime.DateTime,
        locationName: locationData.StationName,
        temperature: locationData.WeatherElement.AirTemperature,
        windSpeed: locationData.WeatherElement.WindSpeed,
      }
      //兩個函式都有setWeatherElement，因此都要把原本的狀態帶進去
      // setWeatherElement((prevState) => ({
      //   ...prevState,
      //   observationTime: locationData.ObsTime.DateTime,
      //   locationName: locationData.StationName,
      //   temperature: locationData.WeatherElement.AirTemperature,
      //   windSpeed: locationData.WeatherElement.WindSpeed,
      //   isLoading: false,
      // }))
    })
}

const fetchWeatherForecast = ({ authorizationKey, cityName }) => {
  //留意這裡的return 直接把fetch api 回傳的promise再回傳回去
  return fetch(`https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${authorizationKey}&locationName=${cityName}`)
    .then((res) => res.json())
    .then((data) => {
      const locationData = data.records.location[0]
      const weatherElements = locationData.weatherElement.reduce((result, item) => {
        if (['Wx', 'PoP', 'CI'].includes(item.elementName)) {
          result[item.elementName] = item.time[0].parameter
        }
        return result
      }, {})

      return {
        description: weatherElements.Wx.parameterName,
        weatherCode: weatherElements.Wx.parameterValue,
        rainPossibility: weatherElements.PoP.parameterName,
        comfortability: weatherElements.CI.parameterName,
      }
    })
}

const useWeatherAPI = ({ stationName, cityName, authorizationKey }) => {
  const [weatherElement, setWeatherElement] = useState({
    observationTime: new Date(),
    locationName: '',
    temperature: 0,
    windSpeed: 0,
    description: '',
    weatherCode: 0,
    rainPossibility: 0,
    comfortability: '',
    isLoading: true,
  })
  const fetchData = useCallback(async () => {
    setWeatherElement((prevState) => ({
      ...prevState,
      isLoading: true,
    }))
    const [currentWeather, weatherForecast] = await Promise.all([fetchCurrentWeather({ authorizationKey, stationName }), fetchWeatherForecast({ authorizationKey, cityName })])

    // console.log(currentWeather, weatherForecast)

    setWeatherElement({
      ...currentWeather,
      ...weatherForecast,
      isLoading: false,
    })
  }, [])
  //參數是要放入函式
  useEffect(() => {
    fetchData()
  }, [fetchData])
  return [weatherElement, fetchData]
}

export default useWeatherAPI
