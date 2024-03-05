import { Result, Button } from 'antd';
import { useHistory } from 'react-router-dom';
import { PATHS } from 'configs';

function NotFound() {
    const history = useHistory();

    const handleGoHome = () => {
        history.push(PATHS.DASHBOARD);
    };

    return (
        <Result
            status="404"
            title="404"
            subTitle="Sorry, the page you visited does not exist."
            extra={
                <Button type="primary" onClick={handleGoHome}>
                    Back Home
                </Button>
            }
        />
    );
}

export default NotFound;
