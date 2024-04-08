import { ThemeProvider } from '@emotion/react'
import styled from '@emotion/styled'
import { useCallback, useEffect, useMemo, useState } from 'react'
// import { ReactComponent as DayCloudyIcon } from './images/day-cloudy.svg'

import { getMoment, findLocation } from './utils/helpers'
import WeatherCard from './views/WeatherCard'
import useWeatherAPI from './hooks/useWeatherAPI'
import WeatherSetting from './views/WeatherSetting'

const theme = {
  light: {
    backgroundColor: '#ededed',
    foregroundColor: '#f9f9f9',
    boxShadow: '0 1px 3px 0 #999999',
    titleColor: '#212121',
    temperatureColor: '#757575',
    textColor: '#828282',
  },
  dark: {
    backgroundColor: '#1F2022',
    foregroundColor: '#121416',
    boxShadow: '0 1px 4px 0 rgba(12, 12, 13, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.15)',
    titleColor: '#f9f9fa',
    temperatureColor: '#dddddd',
    textColor: '#cccccc',
  },
}

const Container = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

const AUTHORIZATION_KEY = 'CWA-EB9CAAEA-CF9D-4D1D-BB30-6002918CF933'
const LOCATION_NAME = '臺北市'
const STATION_NAME = '臺北'

const App = () => {
  const [currentCity, setCurrentCity] = useState(() => localStorage.getItem('cityName') || '臺北市')
  const [currentTheme, setCurrentTheme] = useState('dark')
  const [currentPage, setCurrentPage] = useState('WeatherCard')

  const currentLocation = useMemo(() => findLocation(currentCity), [currentCity])

  const { cityName, locationName, sunriseCityName } = currentLocation
  const [weatherElement, fetchData] = useWeatherAPI({
    stationName: locationName,
    cityName: cityName,
    authorizationKey: AUTHORIZATION_KEY,
  })

  const handleCurrentPageChange = (currentPage) => {
    setCurrentPage(currentPage)
  }

  const handleCurrentCityChange = (currentCity) => {
    setCurrentCity(currentCity)
  }

  const moment = useMemo(() => getMoment(sunriseCityName), [sunriseCityName])

  useEffect(() => {
    setCurrentTheme(moment === 'day' ? 'light' : 'dark')
  }, [moment])

  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <Container>
        {currentPage === 'WeatherCard' && <WeatherCard weatherElement={weatherElement} moment={moment} fetchData={fetchData} handleCurrentPageChange={handleCurrentPageChange} cityName={cityName} />}

        {currentPage === 'WeatherSetting' && <WeatherSetting cityName={cityName} handleCurrentPageChange={handleCurrentPageChange} handleCurrentCityChange={handleCurrentCityChange} />}
      </Container>
    </ThemeProvider>
  )
}

export default App
