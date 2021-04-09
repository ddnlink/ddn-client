import React, { PureComponent } from 'react';
import router from 'umi/router';
import { connect } from 'dva';
import { Button, Avatar, Badge, Rate, Row, Col, Card } from 'antd';
import TagSelect from '@/components/TagSelect';

@connect(({ dapp, user, loading }) => ({
  dapps: dapp.dappsInstalled,
  catagories: dapp.catagories,
  currentAccount: user.currentAccount,
  loading: loading.models.dapp,
}))
class DappInstalledList extends PureComponent {
  state = {
    curCategory: 'all',
  };

  componentDidMount() {
    this.getCatagries();
    this.getDapps();
  }

  getCatagries = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'dapp/fetchCatagories',
    });
  };

  getDapps = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'dapp/fetchDappsInstalled',
      payload: { install: 'true' },
    });
  };

  getCatagryName = type => {
    const { catagories } = this.props;
    const keys = Object.keys(catagories);
    let cName = '';
    keys.forEach(key => {
      if (catagories[key] === Number(type)) {
        cName = key;
      }
    });
    return cName;
  };

  lokkDetail = item => {
    router.push(`/dapp/dapp-detail?dappid=${item.transaction_id}&installed=true`);
  };

  handleOnTagChange = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'dapp/fetchDappsInstalled',
    });
  };

  render() {
    const { dapps, catagories } = this.props;
    const { curCategory } = this.state;
    const catagoryNames = Object.keys(catagories);
    return (
      <div>
        <div style={{ display: 'flex', lineHeight: '30px', margin: '10px' }}>
          <h1 style={{ marginRight: 10, minWidth: '60px' }}>类型</h1>
          <TagSelect expandable onChange={this.handleOnTagChange} value={curCategory}>
            {catagoryNames.length > 0 &&
              catagoryNames.map(category => (
                <TagSelect.Option value={category}>{category}</TagSelect.Option>
              ))}
          </TagSelect>
        </div>
        <Row gutter={24}>
          {dapps &&
            dapps.length > 0 &&
            dapps.map(item => (
              <Col span={6} style={{ margin: '10px 0' }}>
                <Card bordered={false}>
                  <div
                    style={{
                      minHeight: '120px',
                      backgroundColor: '#f5f5f5',
                      padding: '10px',
                      textAlign: 'center',
                    }}
                  >
                    <div>
                      <Avatar size={48} src={`${item.icon ? item.icon : item.name.slice(0, 1)}`} />
                    </div>
                    <div style={{ fontSize: '12px', lineHeight: '24px' }}>
                      <div>{item.name}</div>
                      <div>
                        <Rate allowHalf disabled defaultValue={2.5} style={{ fontSize: '10px' }} />
                        （234）
                      </div>
                      <div>{this.getCatagryName(item.category)}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <div style={{ textAlign: 'center' }}>
                      <Badge color={item ? 'green' : 'gray'} text={item ? '已安装' : '未安装'} />
                    </div>
                    <div style={{ padding: '10px 20px' }}>
                      <Button
                        block
                        type="primary"
                        shape="round"
                        onClick={() => this.lokkDetail(item)}
                      >
                        打 开
                      </Button>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
        </Row>
      </div>
    );
  }
}

export default DappInstalledList;
