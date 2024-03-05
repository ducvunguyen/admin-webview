import React, { useEffect, useState } from 'react';
import moment from 'moment';

import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Table, Select } from 'antd';
import IconCommon from 'components/IconCommon';

import 'react-circular-progressbar/dist/styles.css';
import {
    categoryViewChart,
    dataView,
    offerViewChart, teamOffer,
    totalActiveReact,
    totalActiveReactListChart,
} from 'services/dashboard';

import { numberFormat } from 'utilities/functionCommon';

const styleTextHeader = color => {
    return {
        'fontStyle': 'normal',
        'fontWeight': 700,
        'fontSize': '0.7rem',
        'lineHeight': '0.9rem',
        color: color || '#8798CD',
    };
};

function Dashboard() {
    const [activeReact, setActiveReact] = useState([]);
    useEffect(() => {
        totalActiveReact().then(({data}) => {
            setActiveReact(data)
        });
    }, []);

    return (
        <>
            <div className='w-full '>
                <HeaderDashboard />
                <div className='p-4'>
                    <div className='w-full'>
                        <ChartTopOffersViews />
                    </div>
                    <div className='flex mt-4'>
                        <div className='w-8/12'>
                            <ChartViewGrowth />
                        </div>
                        <div className='w-4/12 pl-3 h-auto flex flex-col justify-between'>
                            <ChartRoadmapPercentageOfViewsByIndustries />
                            <HitDropHeart totalReact={activeReact?.totalReact} />
                        </div>
                    </div>
                    <PostStatistics totalOfferActive={activeReact?.totalOfferActive} />
                </div>
            </div>
        </>
    );
}

const HeaderDashboard = () => {
    const [data, setData] = useState({});

    useEffect(() => {
        dataView().then(({data}) => {
            setData(data);
        });
    }, [])

    const rateIncreasingViewMonthly = () =>{
        return Math.round((data?.totalViewMonthly/(data?.totalView - data?.totalViewMonthly))*100);
    }

    const handleViews = value => {
        let result = Number(value);
        if (result >= 1000 && result <= 1000000) {
            const stringResult = String(numberFormat(result / 1000, 1));
            const splitStringValue = stringResult.split('.');
            const number = Number(splitStringValue[1]) === 0 ? splitStringValue[0] : stringResult;
            result = (result / 1000 % 2 === 0 ? result / 1000 : number) + 'k';
        }

        return result;
    };

    return (
        <div className='w-full h-20 flex items-center p-4'
             style={{ background: 'linear-gradient(0deg, #0F2965, #0F2965)' }}>
            <div className='flex'>
                <div className='w-10'>
                    <CircularProgressbarWithChildren
                        backgroundPadding={5}
                        strokeWidth={10}
                        styles={buildStyles({
                            // Rotation of path and trail, in number of turns (0-1)
                            rotation: 0.25,
                            // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
                            strokeLinecap: 'butt',

                            // Text size
                            textSize: '1.6rem',

                            // How long animation takes to go from one percentage to another, in seconds
                            pathTransitionDuration: 0.5,

                            pathColor: `rgba(62, 152, 199, ${rateIncreasingViewMonthly()/100})`,
                            textColor: '#8798CD',
                            trailColor: '#fff',
                            backgroundColor: '#8798CD',
                        })}
                        value={rateIncreasingViewMonthly()}
                    >
                        <span className='font-bold text-xs' style={{ color: '#8798CD' }}>
                            {rateIncreasingViewMonthly()}%
                        </span>
                    </CircularProgressbarWithChildren>
                </div>
                <div className='pl-2'>
                    <div style={styleTextHeader()}>{data?.totalView}</div>
                    <div className='flex' style={styleTextHeader('#14EF79')}>
                        <IconCommon type='icon-increase'></IconCommon>
                        <span className='pl-1'>{data?.totalViewMonthly}</span>
                    </div>
                    <div style={styleTextHeader()}>Increasing View Monthly</div>
                </div>
            </div>
            <div className='flex pl-5'>
                <div className='w-10 h-10 rounded-full flex items-center justify-center'
                     style={{ background: '#EEEEEE' }}>
                    <IconCommon type='icon-eye'></IconCommon>
                </div>
                <div className='pl-2'>
                    <div style={styleTextHeader()}>{data?.averageViewDaily}</div>
                    <div className='flex' style={styleTextHeader('#14EF79')}>
                        <IconCommon type={data?.averageViewDaily < 0 ? 'icon-decrease' : 'icon-increase'}/>
                        <span className='pl-1'>{data?.averageUserViewLastWeek}</span>
                    </div>
                    <div style={styleTextHeader()}>View Daily</div>
                </div>
            </div>
        </div>
    );
};

const ChartTopOffersViews = () => {
    const [dataSource, setDataSource] = useState([]);
    const [type, setType] = useState('WEEK');

    useEffect(() => {
        loadDataChart();
    }, [type]);

    const loadDataChart = () => {
        offerViewChart(type).then(({data}) => {
            const dataCustom = data.map(item => {
                return [item.title?.trim(), item.view]
            }).sort((a, b) => b[1] - a[1]);
            setDataSource(dataCustom);
        });
    }

    const options = {
        credits: {
            enabled: false,
        },
        chart: {
            animation: {
                duration: 500,
            },
            marginRight: 50,
        },
        title: {
            text: 'Top 5 danh sách ưu đãi nhiều lượt xem nhất',
            align: 'left',
        },
        subtitle: {
            useHTML: true,
            floating: true,
            align: 'right',
            verticalAlign: 'middle',
            y: -20,
            x: -100,
        },

        legend: {
            enabled: false,
        },
        xAxis: {
            type: 'category',
            labels: {
                style: {
                    width:150,
                    textOverflow: 'ellipsis'
                }
            }
        },
        yAxis: {
            opposite: true,
            tickPixelInterval: 150,
            title: {
                text: null,
            },

        },
        plotOptions: {
            series: {
                animation: false,
                groupPadding: 0,
                pointPadding: 0.1,
                borderWidth: 0,
                colorByPoint: false,
                dataSorting: {
                    enabled: true,
                    matchByName: true,
                },
                type: 'bar',
                dataLabels: {
                    enabled: true,
                },
            },
        },
        series: [
            {
                type: 'bar',
                name: 'Lượt xem',
                data: dataSource,
                color: '#03045E'
            },
        ],
        dataLabels: {
            enabled: true,
            rotation: -90,
            color: '#FFFFFF',
            align: 'right',
            format: '{point.y:.1f}', // one decimal
            y: 10, // 10 pixels down from the top

        },
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 550,
                },
                chartOptions: {
                    xAxis: {
                        visible: false,
                    },
                    subtitle: {
                        x: 0,
                    },
                    plotOptions: {
                        series: {
                            dataLabels: [{
                                enabled: true,
                                y: 8,
                            }, {
                                enabled: true,
                                format: '{point.name}',
                                y: -8,
                                style: {
                                    fontWeight: 'normal',
                                    opacity: 0.7,
                                },
                            }],
                        },
                    },
                },
            }],
        },
    };

    return (
        <div className='bg-white p-2'>
            <div className='w-full flex justify-end'>
                <Select
                    defaultValue="WEEK"
                    style={{
                        width: 120,
                    }}
                    onChange={setType}
                    options={[
                        {
                            value: 'WEEK',
                            label: 'Tuần',
                        },
                        {
                            value: 'MONTH',
                            label: 'Tháng',
                        },
                    ]}
                />
            </div>
            <HighchartsReact
                highcharts={Highcharts}
                options={options}
            />
        </div>
    );
};

const ChartViewGrowth = () => {
    const [dataViews, setDataViews] = useState([]);
    const [type, setType] = useState('WEEK');

    useEffect(() => {
        loadDataChart()
    }, [type]);
    
    const loadDataChart = () => {
        totalActiveReactListChart(type).then(({data}) => {
            setDataViews(data.dataView.map(item => {
                return {
                    name: item.date,
                    y: item.view,
                }
            }));
        });
    }
    
    const options = {
        chart: {
            type: 'column',
        },
        credits: {
            enabled: false,
        },
        title: {
            align: 'left',
            text: 'Sự tăng trưởng view',
            style: {
                paddingBottom: '20px'
            }
        },
        accessibility: {
            announceNewData: {
                enabled: true,
            },
        },
        xAxis: {
            type: 'category',
        },
        yAxis: {
            title: {
                text: 'Sự tăng trưởng lượt xem',
            },

        },
        legend: {
            enabled: false,
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                },
            },
        },
        tooltip: {
            // headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
            // pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}</b><br/>',
        },

        series: [
            {
                name: 'Lượt xem',
                colorByPoint: false,
                data: dataViews,
                color: '#03045E'
            },
        ],
    };

    return (
        <div className='bg-white h-full p-2'>
            <div className='w-full mt-5 flex justify-end'>
                <Select
                    defaultValue="WEEK"
                    style={{
                        width: 120,
                    }}
                    onChange={setType}
                    options={[
                        {
                            value: 'WEEK',
                            label: 'Tuần',
                        },
                        {
                            value: 'MONTH',
                            label: 'Tháng',
                        },
                    ]}
                />
            </div>
            <div className='mt-10'>
                <HighchartsReact
                    highcharts={Highcharts}
                    options={options}
                />
            </div>
        </div>
    );
};

const ChartRoadmapPercentageOfViewsByIndustries = () => {
    const time = moment().subtract(1,'months').endOf('month').format('MM/YYYY');
    const [dataSource, setDataSource] = useState([]);
    useEffect(() => {
        loadDataChart();
    }, []);

    const loadDataChart = () => {
        categoryViewChart().then(({ data }) => {
            const dataCustom = data.map((item, index) => {
                if (index === 1)
                    return {
                        name: item.categoryName,
                        y: item.view,
                        sliced: true,
                        selected: true,
                    };
                else return {
                    name: item.categoryName,
                    y: item.view,
                };
            });
            setDataSource(dataCustom);
        });
    };

    const colors = Highcharts.getOptions().colors.map((c, i) =>
        // Start out with a darkened base color (negative brighten), and end
        // up with a much brighter color
        Highcharts.color(Highcharts.getOptions().colors[0])
            .brighten((i - 7) / 7)
            .get()
    );

    const options =  {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie',
        },
        credits: {
            enabled: false,
        },
        title: {
            text: 'Tỷ trọng lượt xem các ngành',
            align: 'left',
        },
        subtitle: {
            align: 'left',
            text: 'Tháng '+ time
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        accessibility: {
            point: {
                valueSuffix: '%'
            }
        },
        plotOptions: {
            pie: {
                colors,
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: false
                },
                showInLegend: true
            },
        },
        legend: {

            itemMarginBottom: 10
        },
        series: [{
            name: 'Tỷ lệ',
            colorByPoint: true,
            data: dataSource
        }]
    };

    return (
        <div className='h-3/4 pb-4'>
            <div className='bg-white h-full'>
                <HighchartsReact
                    highcharts={Highcharts}
                    options={options}
                />
            </div>
        </div>
    );
};

const HitDropHeart = ({totalReact}) => {
    const handleViews = () => {
        let result = Number(totalReact);
        if (result >= 1000 && result <= 1000000) {
            const stringResult = String(numberFormat(result / 1000, 1));
            const splitStringValue = stringResult.split('.');
            const number = Number(splitStringValue[1]) === 0 ? splitStringValue[0] : stringResult;
            result = (result / 1000 % 2 === 0 ? result / 1000 : number) + 'k';
        }

        return result;
    };

    return (
        <div className='bg-white p-4 flex flex-col items-center justify-center'>
            <p className='font-bold text-center'>Lượt thả tim</p>
            <p className='text-center'>Tổng số lượt thả tim</p>
            <div className='text-6xl font-normal text-center'>
                {handleViews()}
            </div>
            <p className='mt-4 text-center'>
                với tổng số các ưu đãi hiện có trong tháng qua
            </p>
        </div>
    );
};

const PostStatistics = ({totalOfferActive}) => {
    const [dataSource,setDataSource] = useState([]);

    useEffect(() => {
        teamOffer().then(({data}) => {
            setDataSource(data)
        })
    }, []);

    const columns = [
        {
            title: 'Teams',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Tổng số bài đăng',
            dataIndex: 'total',
            key: 'total',
        },
        {
            title: 'Đã duyệt',
            dataIndex: 'totalAccept',
            key: 'totalAccept',
        },
        {
            title: 'Chờ duyệt',
            dataIndex: 'totalPending',
            key: 'totalPending',
        },
        {
            title: 'Còn hạn',
            dataIndex: 'totalActive',
            key: 'totalActive',
        },
        {
            title: 'Hết hạn',
            dataIndex: 'totalExpired',
            key: 'totalExpired',
        },
    ];

    return (
        <div className='mt-4 p-4 bg-white'>
            <div className='text-xl font-bold '>Số lượng đăng bài</div>
            <div className='text-slate-500'>Tổng số: <b>{totalOfferActive}</b> ưu đãi đang được kích hoạt</div>
            <Table pagination={false} columns={columns} dataSource={dataSource} />
        </div>
    );
};

export default Dashboard;