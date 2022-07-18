import * as React from 'react';
import ReactApexChart from 'react-apexcharts';
import { OverdueReturnsData } from 'src/modules/reports/types/dto';
import { Row, Col } from 'reactstrap';
import { localise, configService } from 'src/modules/shared/services';
import { dateTimeUtilService } from 'src/modules/shared/services/datetime-util.service';

interface Props {
    transactionData: OverdueReturnsData[]
}

interface ChartData {
    options?: any;
    series?: any;
}

export class OverdueReturnsChart extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
        this.buildGraphDataModel = this.buildGraphDataModel.bind(this);
    }

    buildGraphDataModel(transactionData: OverdueReturnsData[]) {

        let chartData: ChartData = {};
        //get labels
        let fontSize: string;
        let rotate: number;
        let count = transactionData.length <= 32;
        if (count) {
            fontSize = '9px';
            rotate = -25;
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

        //get overdue returns counts
        let values = transactionData.map(td => {
            return td.overdueReturnCount;
        });

        //get total time values
        let hours = transactionData.map(td => {
            return Math.floor(td.overdueTimeInMinutes);
        });

        //chart data
        chartData.options = {
            stroke: {
                width: [0, 2],
            },
            tooltip: {

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
                text: localise('TEXT_OVERDUE_REPORT')
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
            colors: ["#fa815f", "#ffb399"],

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
                labels: {
                    formatter: function (val: any) {
                        return parseInt(val) === val ? val : ''
                    }
                },
                title: {
                    text: localise('TEXT_OVERDUE_RETURN_VOLUME'),
                },

            }, {
                opposite: true,
                labels: {
                    formatter: function (val: any) {
                        return parseInt(val) === val ? val : ''
                    }
                },
                title: {
                    text: localise('TEXT_TOTAL_TIME_OVERDUE_AXIS')
                },
            }]
        };

        chartData.series = [{
            name: localise('TEXT_OVERDUE_RETURN_VOLUME_LEGEND'),
            type: 'column',
            data: values,
            colors: '#fa815f'
        }, {
            name: localise('TEXT_TOTAL_TIME_OVERDUE'),
            type: 'line',
            data: hours,
            colors: '#ffb399'
        }]

        return chartData;
    }

    render() {
        let data = this.buildGraphDataModel(this.props.transactionData);

        return (
            <Row className="mt-2">
                <Col>
                    <ReactApexChart options={data.options} series={data.series} height="400" />
                </Col>
            </Row>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/reports/components/CabinetItemReports/OverdueReturnsReport/OverdueReturnsChart.tsx