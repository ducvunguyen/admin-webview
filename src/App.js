import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import vi_VN from 'antd/lib/locale/vi_VN';
import Layout from 'layout';
import PrivateRoute from 'utilities/PrivateRoute';
import { publicRoutes } from './routes';

import './App.scss';

function App() {
    return (
        <ConfigProvider locale={vi_VN}>
            <BrowserRouter>
                <Switch>
                    {[...publicRoutes].map((route, index) => {
                        return (
                            <Route
                                key={index}
                                path={route.path}
                                exact={route.exact}
                                component={route.main}
                            />
                        );
                    })}
                    <PrivateRoute path="/" component={Layout} />
                </Switch>
            </BrowserRouter>
        </ConfigProvider>
    );
}

export default App;
