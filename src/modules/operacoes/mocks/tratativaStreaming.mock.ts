import type { TratativaStreamingData } from '../types/tratativaOcorrencia.types';

export const mockTratativaStreaming: TratativaStreamingData = {
  deviceName: 'K1 Plus',
  isDeviceOnline: true,
  cameras: [
    { id: 'canal-1', label: 'Canal 1', status: 'online', size: 'large' },
    { id: 'canal-2', label: 'Canal 2', status: 'online', size: 'large' },
    { id: 'canal-3', label: 'Canal 3', status: 'online', size: 'small' },
    { id: 'canal-4', label: 'Canal 4', status: 'online', size: 'small' },
    { id: 'canal-5', label: 'Canal 5', status: 'offline', size: 'small' },
  ],
};
