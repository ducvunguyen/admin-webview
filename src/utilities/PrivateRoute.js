import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getToken } from 'utilities/storage';
import { PATHS } from 'configs';

const isPublicApi = true;

const PrivateRoute = ({
    component: Component,
    redirect: pathname,
    ...rest
}) => {
    return (
        <Route
            {...rest}
            render={(props) =>
                getToken() || isPublicApi ? (
                    <Component {...rest} {...props} />
                ) : (
                    <Redirect
                        to={{
                            pathname,
                        }}
                    />
                )
            }
        />
    );
};

PrivateRoute.defaultProps = { redirect: PATHS.LOGIN };

PrivateRoute.propTypes = {
    component: PropTypes.func.isRequired,
    redirect: PropTypes.string,
};

export default PrivateRoute;
