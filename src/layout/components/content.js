import { Redirect, Route, Switch } from 'react-router-dom';
import { privateRoutes } from '../../routes';
import { PATHS } from '../../configs';
import { Layout } from 'antd';
const { Content } = Layout;

const ContentLayout = () => {
  return <Content
      // style={{
      //     padding: 16,
      // }}
  >
      <Switch>
          {privateRoutes.map((route) =>
                  route.canActive && <Route
                      key={`${route.path}`}
                      path={route.path}
                      exact={route.exact}
                      component={route.main}
                  />
          )}
          <Redirect to={PATHS.NOTFOUND} />
      </Switch>
  </Content>
}

export default ContentLayout;