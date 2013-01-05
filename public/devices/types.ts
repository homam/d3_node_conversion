interface ISubMethod {
    SubMethod?: string;
    Visits: number;
    Subscribers: number;
}

interface IDevice {
    Device: number;
    WURFL_ID: string;
    WURFL_FallBack: string;
    OS: string;
    SubMethods: ISubMethod[];
}

interface IRecord {
    Device: IDevice;
    Visits: number;
}