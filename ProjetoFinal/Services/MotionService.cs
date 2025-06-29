namespace ProjetoFinal.Services;

public class MotionService
{
    public event Action<AccelerometerData>? OnReadingChanged;

    public void Start()
    {
        if (!Accelerometer.IsMonitoring)
        {
            Accelerometer.ReadingChanged += Accelerometer_ReadingChanged;
            Accelerometer.Start(SensorSpeed.Game);
        }
    }

    public void Stop()
    {
        if (Accelerometer.IsMonitoring)
        {
            Accelerometer.ReadingChanged -= Accelerometer_ReadingChanged;
            Accelerometer.Stop();
        }
    }

    private void Accelerometer_ReadingChanged(object? sender, AccelerometerChangedEventArgs e)
    {
        OnReadingChanged?.Invoke(e.Reading);
    }
}