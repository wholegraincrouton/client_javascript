import * as React from 'react';
import ReactApexChart from 'react-apexcharts';
import { Row, Col } from 'reactstrap';
import { localise, configService } from 'src/modules/shared/services';
import { dateTimeUtilService } from 'src/modules/shared/services/datetime-util.service';
import { DailyTransactionData } from 'src/modules/reports/types/dto';

interface Props {
    transactionData: DailyTransactionData[];
    average: number;
}

interface ChartData {
    options?: any;
    series?: any;
}

export class TransactionVolumeChart extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
        this.buildGraphDataModel = this.buildGraphDataModel.bind(this);
    }

    buildGraphDataModel(transactionData: DailyTransactionData[]) {
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
                return dateTimeUtilService.getDateDisplayTextByUserTimeZone(td.transactionDate, configService.getDateTimeFormatConfigurationValue().reportLongMomentDateFormat)
            }
            else {
                return dateTimeUtilService.getDateDisplayTextByUserTimeZone(td.transactionDate, configService.getDateTimeFormatConfigurationValue().momentDateFormat)
            }
        });

        //get transaction counts
        let values = transactionData.map(td => {
            return td.totalVolume;
        });

        //get average values
        let days = transactionData.length;
        let avg: number[] = [];

        for (var i = 1; i <= days; i++) {
            avg.push(this.props.average)
        }

        //chart data
        chartData.options = {
            stroke: {
                width: [0, 2],
                dashArray: [0, 8]
            },
            tooltip: {
                shared: true,
                intersect: false,
                y: [{
                    formatter: function (y: any) {
                        return y;
                    }
                }, {
                    formatter: function (y: any) {
                        if (typeof y !== "undefined") {
                            return y.toFixed(2);
                        }
                        return y;

                    }
                }]
            },
            states: {
                hover: {
                    filter: {
                        type: 'none',
                    }
                },
            },
            title: {
                text: localise('TEXT_TRANSACTION_VOLUME')
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
            colors: ["#4ddbff", "#0099e6"],

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
                    minHeight: undefined,
                    maxHeight: 120,
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
                seriesName: localise('TEXT_TRANSACTION_VOLUME_AXIS'),
                title: {
                    text: localise('TEXT_TRANSACTION_VOLUME_AXIS'),
                },

                labels: {
                    formatter: function (val: any) {
                        return parseInt(val) === val ? val : ''
                    }
                }
            }]
        };

        chartData.series = [{
            name: localise('TEXT_TRANSACTION_VOLUME'),
            type: 'column',
            data: values,
            colors: '#4ddbff'
        }, {
            name: localise('TEXT_AVERAGE_TRANSACTION_VOLUME'),
            type: 'line',
            data: avg,
            colors: '#0099e6'
        }]

        return chartData;
    }

    render() {
        let data = this.buildGraphDataModel(this.props.transactionData);

        return (
            <Row className="mt-2">
                <Col>
                    <ReactApexChart options={data.options} series={data.series} height="350" />
                </Col>
            </Row>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/reports/components/CabinetItemReports/TransactionVolumeReport/TransactionVolumeChart.tsx