import React, { useEffect, useState } from 'react';
import { Card, Dropdown, Col, Row, ProgressBar } from 'react-bootstrap';
import DateTimePicker from 'react-datetime-picker';
import PageHeader from '../pageContainer/header';
import { TbDots } from 'react-icons/tb';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import { useDispatch, useSelector } from 'react-redux';
import { CategoryScale } from 'chart.js';
import {
  getCountry,
  getGeoStats,
  getRegDashboard,
  getRegDashboardMale,
  getUnRegDashboard,
  getUnRegDashboardMale,
  getRegisterUserCount,
} from './action';
import moment from 'moment';
import axios from 'axios';
import Utils from '../../utility';
Chart.register(CategoryScale);

const PageContainer = (props) => {
  const [geoData, setGeoData] = useState({
    place: '',
    gender: '',
    locationType: 'country',
  });
  const {
    registerCompFemaleList,
    registerCompMaleList,
    registerUnCompFemaleList,
    registerUnCompMaleList,
    geoStats,
    dashboardStats,
    rEndDate,
    rStartDate,
    unRstartDate,
    unRendDate,
    registerUserCount,
  } = useSelector((state) => state.userListReducer);
  console.log(registerUserCount);
  const { activeUsers, newUsers, pendingUsers } = registerUserCount;
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getRegDashboard());
    dispatch(getRegDashboardMale());
    dispatch(getUnRegDashboard());
    dispatch(getUnRegDashboardMale());
    dispatch(getCountry());
    dispatch(getGeoStats());
    dispatch(getRegisterUserCount());
    newUsersHandler();
    activeUsersHandler();
    pendingUsersHandler();
  }, []);

  const data = {
    labels:
      !!registerCompFemaleList &&
      registerCompFemaleList.map((value) => [moment.utc(value?.created_at).format('DD/MM')]),
    datasets: [
      {
        label: 'Women',
        data: !!registerCompFemaleList && registerCompFemaleList.map((value) => value?.count),
        fill: false,
        backgroundColor: 'rgb(242 68 98 / 22%)',
        borderColor: '#f24462',
        tension: 0.5,
        borderWidth: 1.5,
        pointBorderWidth: 0,
        pointRadius: 0,
      },
      {
        label: 'Men',
        data: !!registerCompMaleList && registerCompMaleList.map((value) => value?.count),
        fill: true,
        borderColor: '#618CB4',
        tension: 0.5,
        backgroundColor: 'rgb(93 137 179 / 25%)',
        borderWidth: 1.5,
        pointBorderWidth: 0,
        pointRadius: 0,
      },
    ],
  };
  const unCompdata = {
    labels:
      !!registerUnCompFemaleList &&
      registerUnCompFemaleList.map((value) => [moment.utc(value?.created_at).format('DD/MM')]),
    datasets: [
      {
        label: 'Women',
        data: !!registerUnCompFemaleList && registerUnCompFemaleList.map((value) => value?.count),
        fill: false,
        redraw: true,
        backgroundColor: 'rgb(242 68 98 / 22%)',
        borderColor: '#f24462',
        tension: 0.5,
        borderWidth: 1.5,
        pointBorderWidth: 0,
        pointRadius: 0,
      },
      {
        label: 'Men',
        data: !!registerUnCompMaleList && registerUnCompMaleList.map((value) => value?.count),
        fill: true,
        redraw: true,
        borderColor: '#618CB4',
        tension: 0.5,
        backgroundColor: 'rgb(93 137 179 / 25%)',
        borderWidth: 1.5,
        pointBorderWidth: 0,
        pointRadius: 0,
      },
    ],
  };
  const { count = 0, percent = 0, sign = '' } = dashboardStats;
  const dashboardStatsFunc = (func, status, timeframe, type) => {
    dispatch(
      func(status, moment().subtract(timeframe, type).utc().format(), moment().utc().format())
    );
  };
  const getGeoLocationData = (place, gender, locationType) => {
    dispatch(getGeoStats(place, gender, locationType));
    setGeoData({ place, gender, locationType });
  };

  const [newStartDate, setNewStartDate] = useState(null);
  const [newEndDate, setNewEndDate] = useState(null);
  const [activeStartDate, setActiveStartDate] = useState(null);
  const [activeEndDate, setActiveEndDate] = useState(null);
  const [pendingStartDate, setPendingStartDate] = useState(null);
  const [pendingEndDate, setPendingEndDate] = useState(null);

  const [newUserCount, setNewUserCount] = useState('');
  const [activeUserCount, setActiveUserCount] = useState('');
  const [pendingUserCount, setPendingUserCount] = useState('');

  useEffect(() => {
    if(newStartDate !== null && newEndDate !== null) newUsersHandler();
  }, [newStartDate, newEndDate]);

  useEffect(() => {
    if(activeStartDate !== null && activeEndDate !== null) activeUsersHandler();
  }, [activeStartDate, activeEndDate]);

  useEffect(() => {
    if(pendingStartDate !== null && pendingEndDate !== null) pendingUsersHandler();
  }, [pendingStartDate, pendingEndDate]);

  const newUsersHandler = async () => {
    if(newStartDate !== null && newEndDate !== null) {
    try {
      const formattedStartDate = moment(newStartDate).format('YYYY-MM-DD HH:mm:ss');
      const formattedEndDate = moment(newEndDate).format('YYYY-MM-DD HH:mm:ss');

      const { data } = await axios.get(
        `${Utils.constants.API_URL}/dashboard/users-counts-by-date?status=1&user_type=new&start_date=${formattedStartDate}&end_date=${formattedEndDate}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
          },
        }
      );

      const { count } = data.data;
      setNewUserCount(count);
    } catch (error) {
      console.error(error);
    }
  }
  };

  const activeUsersHandler = async () => {
    if(activeStartDate !== null && activeEndDate !== null) {
    try {
      const formattedStartDate = moment(activeStartDate).format('YYYY-MM-DD HH:mm:ss');
      const formattedEndDate = moment(activeEndDate).format('YYYY-MM-DD HH:mm:ss');

      const { data } = await axios.get(
        `${Utils.constants.API_URL}/dashboard/users-counts-by-date?status=2&user_type=active&start_date=${formattedStartDate}&end_date=${formattedEndDate}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
          },
        }
      );
      const { count } = data.data;
      setActiveUserCount(count);
    } catch (error) {
      console.error(error);
    }
  }
  };

  const pendingUsersHandler = async () => {
    if(pendingStartDate !== null && pendingEndDate !== null) {
    try {
      const formattedStartDate = moment(pendingStartDate).format('YYYY-MM-DD HH:mm:ss');
      const formattedEndDate = moment(pendingEndDate).format('YYYY-MM-DD HH:mm:ss');

      const { data } = await axios.get(
        `${Utils.constants.API_URL}/dashboard/users-counts-by-date?status=1&user_type=pending&start_date=${formattedStartDate}&end_date=${formattedEndDate}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
          },
        }
      );
      const { count } = data.data;
      setPendingUserCount(count);
    } catch (error) {
      console.error(error);
    }
  }
  };

  return (
    <div className="inner-page">
      <PageHeader title="Dashboard" />
      <div className="dashboardPageUI">
        <Row>
          <Col md="4" sm="12">
            <Card className="gridCard last-login-card">
              <Card.Header>
                <Card.Title>Active Users</Card.Title>
                <Card.Subtitle>{`(since last login: ${
                  activeUsers?.beforeLoginCount || 0
                })`}</Card.Subtitle>
                <div className="clandr-date">
                {activeStartDate === null && activeEndDate === null && <h6 style={{fontSize: "16px", cursor: "pointer"}} onClick={() => {
                  setActiveStartDate(moment().subtract(7, 'days').toDate())
                  setActiveEndDate(new Date())
                }}>Select Date</h6>}
                {activeStartDate !== null && activeEndDate !== null && <>
                  <DateTimePicker
                    onChange={setActiveStartDate}
                    value={activeStartDate}
                    calendarClassName="graphFilter"
                    disableClock="false"
                    format="dd/MM/y"
                    minDetail="decade"
                  />
                  <span className="dategap"> - </span>
                  <DateTimePicker
                    onChange={setActiveEndDate}
                    value={activeEndDate}
                    calendarClassName="graphFilter"
                    disableClock="false"
                    format="dd/MM/y"
                  /></>}
                </div>
              </Card.Header>
              <Card.Body>
                <Card.Subtitle>{activeStartDate !== null && activeEndDate !== null ? activeUserCount : activeUsers?.count || 0} people</Card.Subtitle>
                <Card.Text>{activeUsers?.percent || 0}% </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md="4" sm="12">
            <Card className="gridCard  last-login-card">
              <Card.Header>
                <Card.Title>New Users</Card.Title>
                <Card.Subtitle>{`(since last login: ${
                  newUsers?.beforeLoginCount || 0
                })`}</Card.Subtitle>
                <div className="clandr-date">
                {newStartDate === null && newEndDate === null && <h6 style={{fontSize: "16px", cursor: "pointer"}} onClick={() => {
                  setNewStartDate(moment().subtract(7, 'days').toDate())
                  setNewEndDate(new Date())
                }}>Select Date</h6>}
                {newStartDate !== null && newEndDate !== null && <>
                  <DateTimePicker
                    onChange={setNewStartDate}
                    value={newStartDate}
                    calendarClassName="graphFilter"
                    disableClock="false"
                    format="dd/MM/y"
                    minDetail="decade"
                  />
                  <span className="dategap"> - </span>
                  <DateTimePicker
                    onChange={setNewEndDate}
                    value={newEndDate}
                    calendarClassName="graphFilter"
                    disableClock="false"
                    format="dd/MM/y"
                  /></>}
                  </div>
              </Card.Header>
              <Card.Body>
                <Card.Subtitle>{newStartDate !== null && newEndDate !== null ? newUserCount : newUsers?.count || 0} people</Card.Subtitle>
                <Card.Text>{newUsers?.percent || 0}% </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md="4" sm="12">
            <Card className="gridCard  last-login-card">
              <Card.Header>
                <Card.Title>Pending Users</Card.Title>
                <Card.Subtitle>{`(since last login: ${
                  pendingUsers?.beforeLoginCount || 0
                })`}</Card.Subtitle>
                <div className="clandr-date">
                {pendingStartDate === null && pendingEndDate === null && <h6 style={{fontSize: "16px", cursor: "pointer"}} onClick={() => {
                  setPendingStartDate(moment().subtract(7, 'days').toDate())
                  setPendingEndDate(new Date())
                }}>Select Date</h6>}
                {pendingStartDate !== null && pendingEndDate !== null && <>
                  <DateTimePicker
                    onChange={setPendingStartDate}
                    value={pendingStartDate}
                    calendarClassName="graphFilter"
                    disableClock="false"
                    format="dd/MM/y"
                    minDetail="decade"
                  />
                  <span className="dategap"> - </span>
                  <DateTimePicker
                    onChange={setPendingEndDate}
                    value={pendingEndDate}
                    calendarClassName="graphFilter"
                    disableClock="false"
                    format="dd/MM/y"
                    /></>}
                    </div>
              </Card.Header>
              <Card.Body>
                <Card.Subtitle>{pendingStartDate !== null && pendingEndDate !== null ? pendingUserCount : pendingUsers?.count || 0} people</Card.Subtitle>
                <Card.Text>{pendingUsers?.percent || 0}% </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md="8" sm="12">
            <Card className="gridCard">
              <Card.Header>
                <Row className="w-100">
                  <Col md="8">
                    <Card.Title> Registration Completed </Card.Title>
                  </Col>
                  <Col md="4" className="clandr-date">
                    <DateTimePicker
                      onChange={(e) => {
                        dispatch({
                          type: Utils.ActionName.GET_REGCOMPFEMALE,
                          type: Utils.ActionName.GET_REGCOMPMALE,
                          payload: { rStartDate: e },
                        });
                        dispatch(getRegDashboard('', rStartDate, rEndDate));
                        dispatch(getRegDashboardMale('', rStartDate, rEndDate));
                      }}
                      value={rStartDate}
                      calendarClassName="graphFilter"
                      disableClock="false"
                      format="dd/MM/y"
                      minDetail="decade"
                    />
                    <span className="dategap"> - </span>
                    <DateTimePicker
                      onChange={(e) => {
                        dispatch({
                          type: Utils.ActionName.GET_REGCOMPFEMALE,
                          type: Utils.ActionName.GET_REGCOMPMALE,
                          payload: { rEndDate: e },
                        });
                        dispatch(getRegDashboard('', rStartDate, rEndDate));
                        dispatch(getRegDashboardMale('', rStartDate, rEndDate));
                      }}
                      value={rEndDate}
                      calendarClassName="graphFilter"
                      disableClock="false"
                      format="dd/MM/y"
                    />
                  </Col>
                </Row>
              </Card.Header>
              <Card.Body>
                <Line data={data} />
              </Card.Body>
            </Card>
            {/* end section */}
            <Card className="gridCard">
              <Card.Header>
                <Row className="w-100">
                  <Col md="8">
                    <Card.Title> Registration Uncompleted </Card.Title>
                  </Col>
                  <Col md="4" className="clandr-date">
                    <DateTimePicker
                      onChange={(e) => {
                        dispatch({
                          type: Utils.ActionName.GET_REGUNCOMPFEMALE,
                          type: Utils.ActionName.GET_REGUNCOMPMALE,
                          payload: { unRstartDate: e },
                        });
                        dispatch(getUnRegDashboard('', unRstartDate, unRendDate));
                        dispatch(getUnRegDashboardMale('', unRstartDate, unRendDate));
                      }}
                      value={unRstartDate}
                      calendarClassName="graphFilter"
                      disableClock="false"
                      format="dd/MM/y"
                    />
                    <span className="dategap"> - </span>
                    <DateTimePicker
                      onChange={(e) => {
                        dispatch({
                          type: Utils.ActionName.GET_REGUNCOMPFEMALE,
                          type: Utils.ActionName.GET_REGUNCOMPMALE,
                          payload: { unRendDate: e },
                        });
                        dispatch(getUnRegDashboard('', unRstartDate, unRendDate));
                        dispatch(getUnRegDashboardMale('', unRstartDate, unRendDate));
                      }}
                      value={unRendDate}
                      calendarClassName="graphFilter"
                      disableClock="false"
                      format="dd/MM/y"
                    />
                  </Col>
                </Row>
              </Card.Header>
              <Card.Body>
                <Line data={unCompdata} />
              </Card.Body>
            </Card>
          </Col>

          <Col md="4" sm="12">
            <Card className="gridCard">
              <Card.Header>
                <Card.Title> Geo </Card.Title>
                <Card.Link
                  role="button"
                  onClick={() => {
                    getGeoLocationData('', '', 'country');
                  }}>
                  Country
                </Card.Link>
                {/* <Card.Link onClick={() => {
                  dispatch(getGeoStats("", "", "city"))}}> City </Card.Link> */}

                <Dropdown align="end" style={{ marginLeft: '16px', cursor: 'pointer' }}>
                  <Dropdown.Toggle id="dropdown-button-dark-example1" variant="secondary">
                    <TbDots />
                  </Dropdown.Toggle>

                  <Dropdown.Menu variant="dark">
                    <Dropdown.Item
                      onClick={() => {
                        getGeoLocationData(geoData.place, 'female', geoData.locationType);
                      }}>
                      Female
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => {
                        getGeoLocationData(geoData.place, 'male', geoData.locationType);
                      }}>
                      Male
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => {
                        getGeoLocationData(geoData.place, '', geoData.locationType);
                      }}>
                      Both
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Card.Header>
              <Card.Body>
                <Row className="w-100">
                  {geoStats.length > 0
                    ? geoStats.map((value, index) => {
                        return (
                          <Col
                            md="6"
                            className="mb-4 progressBarBox"
                            role={geoData.locationType === 'country' ? 'button' : ''}
                            onClick={() => {
                              if (geoData.locationType === 'country') {
                                getGeoLocationData(value?.location, geoData.gender, 'city');
                              }
                            }}>
                            <h6
                              className={
                                geoData.locationType === 'country' ? 'location-country' : ''
                              }>
                              {' '}
                              {value?.location} <span>{value?.totalCount}%</span>{' '}
                            </h6>
                            <ProgressBar now={value?.totalCount} />
                          </Col>
                        );
                      })
                    : 'Record Not Found.'}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};
export default PageContainer;
