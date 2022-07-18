import * as React from 'react';
import ReactApexChart from 'react-apexcharts';
import { OnTimeReturnsData } from 'src/modules/reports/types/dto';
import { Row, Col } from 'reactstrap';
import { localise, configService } from 'src/modules/shared/services';
import { dateTimeUtilService } from 'src/modules/shared/services/datetime-util.service';

interface Props {
    transactionData: OnTimeReturnsData[]
}

interface ChartData {
    options?: any;
    series?: any;
}

export class OnTimeReturnsChart extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
        this.buildGraphDataModel = this.buildGraphDataModel.bind(this);
    }

    buildGraphDataModel(transactionData: OnTimeReturnsData[]) {
        let chartData: ChartData = {};
        //get labels
        let fontSize: string;
        let rotate: number;
        let count = transactionData.length < 50;

        if (count) {
            fontSize = '9px';
            rotate = -30;
        }
        else {
            fontSize = '7px';
            rotate = -90;
        }

        let isSimpleFormat = transactionData.length < 11;
        let timeLabels = transactionData.map(td => {
            if (isSimpleFormat) {
                rotate = 0;
                return dateTimeUtilService.getDateDisplayTextByUserTimeZone(td.returnDate, configService.getDateTimeFormatConfigurationValue().reportLongMomentDateFormat)
            }
            else {
                return dateTimeUtilService.getDateDisplayTextByUserTimeZone(td.returnDate, configService.getDateTimeFormatConfigurationValue().momentDateFormat)
            }
        });

        //get on time returns counts
        let values = transactionData.map(td => {
            return td.onTimeReturnCount;
        });

        //get average values
        let value: number;
        let percentage = transactionData.map(td => {
            if (td.onTimeReturnCount == 0) {
                return 0
            }
            else {
                value = (td.onTimeReturnCount / td.totalVolume) * 100;
                return Math.round(value);
            }
        });

        //chart data
        chartData.options = {
            stroke: {
                width: [0, 2],
            },
            markers: {
                size: 5,
                strokeWidth: 1,
                strokeOpacity: 0.9,
                fillOpacity: 1,
                shape: "circle",
                radius: 2,
                offsetX: 0,
                offsetY: 0,
                hover: {
                    size: 6
                }
            },
            states: {
                hover: {
                    filter: {
                        type: 'none',
                    }
                },
            },
            title: {
                text: localise('TEXT_ON_TIME_RETURNS_REPORT')
            },
            legend: {
                position: 'top',
            },
            chart: {
                toolbar: {
                    show: true,
                    tools: {
                        download: false,
                        selection: true
                    },
                    autoSelected: 'zoom'
                },
            },
            colors: ["#a7d164", "#d1f29b"],

            labels: timeLabels,
            xaxis: {
                type: 'category',
                labels: {
                    show: true,
                    rotate: rotate,
                    rotateAlways: !isSimpleFormat,
                    hideOverlappingLabels: true,
                    showDuplicates: false,
                    trim: true,
                    style: {
                        colors: [],
                        fontSize: fontSize,
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        cssClass: 'apexcharts-xaxis-label',
                    },
                    offsetX: 0,
                    offsetY: 0,
                    format: undefined,
                    formatter: undefined,
                    datetimeFormatter: {
                        year: 'yyyy',
                        month: "MMM 'yy",
                        day: 'dd MMM',
                        hour: 'HH:mm',
                    },
                },
            },
            yaxis: [{
                title: {
                    text: localise('TEXT_ON_TIME_RETURN_VOLUME'),
                },
                labels: {
                    formatter: function (val: any) {
                        return parseInt(val) === val ? val : ''
                    }
                },

            }, {
                opposite: true,
                title: {
                    text: localise('TEXT_PERCENTAGE_VOLUME')
                },
                max: 100,
            }]
        };

        chartData.series = [{
            name: localise('TEXT_ON_TIME_RETURN_VOLUME'),
            type: 'column',
            data: values,
            colors: '#4ddbff'
        }, {
            name: localise('TEXT_PERCENTAGE_VOLUME'),
            type: 'line',
            data: percentage,
            colors: '#0099e6'
        }]

        return chartData;
    }

    render() {
        let data = this.buildGraphDataModel(this.props.transactionData);

        return (
            <Row className="mt-2">
                <Col>
                    <ReactApexChart options={data.options} series={data.series} height="450" />
                </Col>
            </Row>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/reports/components/CabinetItemReports/OnTimeReturnsReport/OnTimeReturnsChart.tsx