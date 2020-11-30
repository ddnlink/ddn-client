import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Card, Table, Alert, Modal } from 'antd';
import { formatMessage } from 'umi/locale';
import { getKeyStore } from '@/utils/authority';
import DelegateModal from './DelegateModal';
import VoteModal from './VoteModal';
import styles from './DelegatesList.less';

/* eslint react/no-multi-comp:0 */
@connect(({ vote, user, loading }) => ({
  vote,
  currentAccount: user.currentAccount,
  loading: loading.models.vote,
}))
class VoteList extends PureComponent {
  state = {
    selectedRows: [],
    selectedRowKeys: [],
    visibleDelegate: false,
    curDelegate: {},
  };

  columns = [
    {
      title: formatMessage({ id: 'app.vote.rate' }),
      dataIndex: 'rate',
    },
    {
      title: formatMessage({ id: 'app.vote.delegateName' }),
      dataIndex: 'username',
    },
    {
      title: formatMessage({ id: 'app.vote.address' }),
      dataIndex: 'address',
      render: (text, record) => (
        <Fragment>
          <a
            rel="noopener"
            onClick={() => {
              this.handleSetCurDelegate(record);
            }}
          >
            {' '}
            {record.address}{' '}
          </a>
        </Fragment>
      ),
    },
    {
      title: formatMessage({ id: 'app.vote.approval' }),
      dataIndex: 'approval',
      // align: 'right',
      render: val => `${val} %`,
    },
    {
      title: formatMessage({ id: 'app.vote.productivity' }),
      dataIndex: 'productivity',
      // align: 'right',
      render: val => `${val} %`,
    },
  ];

  componentDidMount() {
    const { dispatch, currentAccount } = this.props;
    dispatch({
      type: 'vote/fetchVotedDelegates',
      payload: { address: currentAccount.address },
    });
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }
  };

  handleSelectRows = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedRows,
      selectedRowKeys,
    });
  };

  cleanSelectedKeys = () => {
    this.handleSelectRows([], []);
  };

  handleVoteDelegate = async () => {
    const { selectedRows } = this.state;
    const { dispatch } = this.props;
    const keyStore = getKeyStore();
    if (selectedRows.length < 1) return;
    const datap = selectedRows.map(row => `-${row.publicKey}`);
    const trs = await DdnJS.vote.createVote(datap, keyStore.phaseKey);
    const payload = { transaction: trs };
    dispatch({
      type: 'vote/voting',
      payload,
      callback: response => {
        this.setState({
          selectedRows: [],
        });
      },
    });
  };

  handleSetCurDelegate = record => {
    this.setState({
      curDelegate: record,
      visibleDelegate: true,
    });
  };

  handleCloseDelegateModal = () => {
    this.setState({
      curDelegate: {},
      visibleDelegate: false,
    });
  };

  render() {
    const {
      vote: { votedDelegates },
      loading,
    } = this.props;
    const { selectedRowKeys, selectedRows, visibleDelegate, curDelegate } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleSelectRows,
      getCheckboxProps: record => ({
        disabled: record.voted,
      }),
    };

    return (
      <div>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableAlert}>
              <Alert
                message={
                  <Fragment>
                    {formatMessage({ id: 'app.vote.selected' })}{' '}
                    <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a>{' '}
                    {formatMessage({ id: 'app.vote.item' })}
                    &nbsp;&nbsp;
                    <a onClick={this.cleanSelectedKeys} style={{ marginLeft: 24 }}>
                      {formatMessage({ id: 'app.vote.clean-up' })}
                    </a>
                    <div style={{ float: 'right' }}>
                      {selectedRowKeys.length > 0 && (
                        <VoteModal
                          selectedRows={selectedRows}
                          deVote
                          handleDeleteDelegate={this.handleDeleteDelegate}
                          handleVoteDelegate={this.handleVoteDelegate}
                        />
                      )}
                    </div>
                  </Fragment>
                }
                type="info"
                showIcon
              />
            </div>
            <Table
              loading={loading}
              rowKey={record => record.username}
              rowSelection={rowSelection}
              dataSource={votedDelegates.list}
              columns={this.columns}
              pagination={votedDelegates.paginationProps}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        <Modal
          centered
          visible={visibleDelegate}
          width="600px"
          bodyStyle={{ padding: '30px 50px' }}
          onCancel={this.handleCloseDelegateModal}
          footer={false}
          destroyOnClose
        >
          <DelegateModal curDelegate={curDelegate} />
        </Modal>
      </div>
    );
  }
}

export default VoteList;
