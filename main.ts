function LogData () {
    datalogger.log(datalogger.createCV("Temp", Kitronik_klimate.temperature(Kitronik_klimate.TemperatureUnitList.C)))
    datalogger.log(datalogger.createCV("Humidity", Kitronik_klimate.humidity()))
    datalogger.log(datalogger.createCV("BarometricPressure", Kitronik_klimate.pressure(Kitronik_klimate.PressureUnitList.mBar)))
    datalogger.log(datalogger.createCV("HeatIndex", heatindexC))
    datalogger.log(datalogger.createCV("DewPoint", TdP))
}
datalogger.onLogFull(function () {
    datalogger.deleteLog()
})
function FirstRun () {
    datalogger.setColumnTitles(
    "Temp",
    "Humidity",
    "BarometricPressure",
    "HeatIndex",
    "DewPoint",
    "Time"
    )
    datalogger.includeTimestamp(FlashLogTimeStampFormat.None)
    LogData()
}
input.onButtonPressed(Button.A, function () {
    power.fullPowerOn(FullPowerSource.A)
    led.setBrightness(60)
    led.enable(true)
    Temperature()
    humidity()
    dewPoint()
    heatIndex()
    mBarPressure()
    LogData()
    basic.clearScreen()
    led.enable(false)
    power.lowPowerEnable(LowPowerEnable.Allow)
})
function humidity () {
    serial.writeValue("Humidity", Kitronik_klimate.humidity())
    basic.showString("Humidity" + "is" + Kitronik_klimate.humidity() + "%")
    bluetooth.uartWriteLine("Humidity" + "is" + Kitronik_klimate.humidity() + "%")
}
function heatIndex () {
    if (Kitronik_klimate.temperature(Kitronik_klimate.TemperatureUnitList.C) >= 22) {
        TempF = Kitronik_klimate.temperature(Kitronik_klimate.TemperatureUnitList.F)
        humidityPercent = Kitronik_klimate.humidity()
        HI = Math.trunc(0.5 * (TempF + 61 + (TempF - 68) * 1.2 + humidityPercent * 0.094))
        if (HI >= 80) {
            HI = Math.trunc(-42.379 + 2.04901523 * TempF + 10.14333127 * humidityPercent - 0.22475541 * TempF * humidityPercent - 0.00683783 * TempF * TempF - 0.05481717 * humidityPercent * humidityPercent + 0.00122874 * TempF * TempF * humidityPercent + 0.00085282 * TempF * humidityPercent * humidityPercent - 0.00000199 * TempF * TempF * humidityPercent * humidityPercent)
            if (humidityPercent < 13 && (TempF > 80 || TempF <= 112)) {
                HI = Math.trunc(HI - (13 - humidityPercent) / 4 * Math.sqrt((17 - Math.abs(TempF - 95)) / 17))
            } else if (humidityPercent > 85 && (TempF > 80 || TempF <= 87)) {
                HI = Math.trunc(HI + (humidityPercent - 85) / 10 * ((87 - TempF) / 5))
            }
        }
        heatindexC = Math.trunc((HI - 32) * 5 / 9)
        serial.writeValue("Heat Index (Fahrenheit)", HI)
        serial.writeValue("Heat Index (Celcius)", heatindexC)
        basic.showString("Heat" + "index" + "is" + heatindexC + "°C")
    }
}
function dewPoint () {
    TdP = Math.trunc(Kitronik_klimate.temperature(Kitronik_klimate.TemperatureUnitList.C) - (100 - Kitronik_klimate.humidity()) / 5)
    serial.writeValue("Dew Point", TdP)
    basic.showString("Dew" + "point" + "is" + TdP + "°C")
}
function Temperature () {
    serial.writeValue("Temperature", Kitronik_klimate.temperature(Kitronik_klimate.TemperatureUnitList.C))
    basic.showString("Temperature" + "is" + Kitronik_klimate.temperature(Kitronik_klimate.TemperatureUnitList.C) + "°C")
}
function mBarPressure () {
    serial.writeValue("Barometric Pressure", Kitronik_klimate.pressure(Kitronik_klimate.PressureUnitList.mBar))
    basic.showString("Barometric" + "pressure" + "is" + Kitronik_klimate.pressure(Kitronik_klimate.PressureUnitList.mBar) + "mBar")
}
let HI = 0
let humidityPercent = 0
let TempF = 0
let TdP = 0
let heatindexC = 0
FirstRun()
/**
 * Calculates dew point (temperature below which water condenses and dew forms)
 */
// Main script: sets brightness, turns on LEDs and Bluetooth service. The script then calls the encoded functions for temperature, pressure, humidity, dew point, and heat index. The LEDs turn off after reporting, and waits for 10 minutes before making another report.
basic.forever(function () {
    led.setBrightness(60)
    led.enable(true)
    Temperature()
    humidity()
    dewPoint()
    heatIndex()
    mBarPressure()
    LogData()
    basic.clearScreen()
    led.enable(false)
    power.lowPowerEnable(LowPowerEnable.Allow)
    power.lowPowerRequest(LowPowerMode.Wait)
    basic.pause(600000)
})
