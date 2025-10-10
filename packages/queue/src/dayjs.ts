import dayjsBase, { type ConfigType, type Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjsBase.extend(utc);

/**
 * dayjs utc wrapper
 */
export const dayjs = (date?: ConfigType): Dayjs => dayjsBase.utc(date);
