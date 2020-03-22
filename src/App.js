import React, {useState, useEffect, useCallback, createContext, useContext} from 'react';

const fetchHandler = (method, path, body) => {
    let server = `http://${window.location.host}/api`;
    if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_BACKEND_PORT) {
        server = `http://${window.location.hostname}:${process.env.REACT_APP_BACKEND_PORT}/api`;
    }
    let address = server + path;
    const reqObject = {
        method: method,
        body: body ? JSON.stringify(body) : undefined,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    return new Promise((resolve, reject) => {
        fetch(address, reqObject)
            .then(response => {
                if (response && response.ok) {
                    try {
                        let result = response.json();
                        if (result.error) {
                            reject(result);
                        } else {
                            resolve(result);
                        }
                    } catch (err) {
                        reject(err);
                    }
                } else {
                    reject({error: true, message: 'No response body'});
                }
            })
            .catch(error => reject(error));
    });
};

const rootFlexRowStyle = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
};
const rootFlexColStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    maxWidth: '720px',
    marginTop: 'auto',
    marginBottom: 'auto',
};

const acceptableDnsKeys = ['type', 'name', 'content'];

const RecordDisplayer = props => {
    const {records: fetchedRecords, updateRecord, id, addRecord,refresh} = props;
    const setFetching = useContext(FetchContext);
    let [records, setRecords] = useState({...fetchedRecords});
    const updateRecords = (i, key) => {
        let {value} = i.target;
        let newRecords = {...records};
        newRecords[key] = value;
        setRecords(newRecords);
    };
    const resetRecords = () => {
        setRecords({...fetchedRecords});
    };
    const submit = () => {
        setFetching(true);
        let recordsToSubmit = acceptableDnsKeys.reduce((sum, curr) => {
            let toReturn = {...sum};
            toReturn[curr] = records[curr];
            return toReturn;
        }, {});
        if (id === true) recordsToSubmit['ttl'] = 1;
        let method = id === true ? 'POST' : 'PUT';
        let postpend = id === true ? '' : `/${id}`;
        fetchHandler(method, postpend, recordsToSubmit)
            .then(res => {
                let {result} = res;
                id === true ? addRecord(result) : updateRecord(result);
                setFetching(false);
            })
            .catch(err => {
                console.log(err);
                setFetching(false);
            });
    };

    const mapped = acceptableDnsKeys.map(key => (
        <dl key={key}>
            <dt>{key}</dt>
            {id !== true ? <dd>{fetchedRecords[key]}</dd> : null}
            <dd>
                <input
                    type='text'
                    value={records[key]}
                    onChange={i => updateRecords(i, key)}
                    style={{borderColor: id === true || fetchedRecords[key] === records[key] ? 'inherit' : '#9fc'}}
                ></input>
            </dd>
        </dl>
    ));
    return (
        <div>
            <dl>{mapped}</dl>
            <div style={{...rootFlexRowStyle, height: 'unset', justifyContent: 'space-around'}}>
                <button onClick={submit}>Submit</button>
                <button onClick={resetRecords}>Reset</button>
                <button onClick={refresh} >Refresh</button>
            </div>
        </div>
    );
};

const RecordTables = props => {
    let {data, openUp, deleteRecord} = props;

    if (data && data.length)
        return (
            <table style={{width: '100%'}}>
                <thead>
                    <tr>
                        {acceptableDnsKeys.map(key => (
                            <td key={key}>{key}</td>
                        ))}
                        <td>Edit</td>
                    </tr>
                </thead>
                <tbody>
                    {data.map(row => (
                        <tr key={row.id}>
                            {acceptableDnsKeys.map(field => {
                                let text = row[field];
                                let usedString = text.length <= 32 ? text : text.slice(0, 30) + '  ...';
                                return <td key={field}>{usedString}</td>;
                            })}
                            <td>
                                <div style={rootFlexRowStyle}>
                                    <button onClick={() => openUp(row.id)}>View</button>
                                    <button onClick={() => deleteRecord(row.id)}>Delete</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    return <p>No data available</p>;
};

const FetchContext = createContext(false);

const App = props => {
    const [fetching, setFetching] = useState(false);
    const [data, setData] = useState(null);
    const [totalPage, setTotalPage] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentId, setCurrentId] = useState(null);
    let pageCounter = [];
    for (let p = 0; p < totalPage; p++) {
        pageCounter.push(p + 1);
    }
    const fetchData = useCallback(
        async currentPage => {
            try {
                setFetching(true);
                let appender = `?page=${currentPage}`;
                let apiData = await fetchHandler('GET', appender);
                if (apiData && apiData.data) {
                    let {result_info, result} = apiData.data;
                    setTotalPage(result_info.total_pages);
                    setData(result);
                    setFetching(false);
                } else {
                    setData(false);
                    setFetching(false);
                }
            } catch (err) {
                setData(false);
            }
        },
        [setTotalPage, setData, setFetching]
    );
    useEffect(() => {
        fetchData(currentPage);
    }, [fetchData, currentPage]);
    let updateSingleRecord = record => {
        let newRecords = [...data];
        let index = newRecords.findIndex(row => row.id === record.id);
        newRecords.splice(index, 1, {...record});
        setData(newRecords);
    };
    let addRecord = record => {
        setData([...data, record]);
        setCurrentId(null);
    };
    let deleteRecord = id => {
        setFetching(true);
        fetchHandler('DELETE', `/${id}`)
            .then(_ => {
                let newRecords = [...data];
                let index = newRecords.findIndex(row => row.id === id);
                newRecords.splice(index, 1);
                setData(newRecords);
                setFetching(false);
            })
            .catch(err => {
                console.log(err);
                setFetching(false);
            });
    };
    let backButton = currentId && <button onClick={() => setCurrentId(null)}>Back to Record list</button>;
    let pageButtons =
        totalPage > 1 && !currentId
            ? [
                  ...pageCounter.map(p => <button onClick={() => setCurrentPage(p)}>{p}</button>),
                  <button onClick={() => setCurrentId(true)}>New</button>,
                  <button onClick={() => fetchData(currentPage)}>Refresh</button>,
              ]
            : null;
    return (
        <FetchContext.Provider value={setFetching}>
            <h1 style={{textAlign: 'center'}}>Update DNS</h1>
            {totalPage > 1 ? (
                <div style={{...rootFlexRowStyle, alignItems: 'baseline'}}>
                    <span>Pages: </span>
                    {backButton}
                    {pageButtons}
                </div>
            ) : null}
            <div style={rootFlexRowStyle}>
                <div style={rootFlexColStyle}>
                    {currentId ? (
                        <RecordDisplayer
                            records={data.find(row => row.id === currentId)}
                            updateRecord={updateSingleRecord}
                            addRecord={addRecord}
                            refresh={() => fetchData(currentPage)}
                            id={currentId}
                        />
                    ) : (
                        <RecordTables data={data} openUp={setCurrentId} deleteRecord={deleteRecord} />
                    )}
                </div>
            </div>
            {totalPage > 1 ? (
                <div style={{...rootFlexRowStyle, alignItems: 'baseline'}}>
                    <span>Pages: </span>
                    {backButton}
                    {pageButtons}
                </div>
            ) : null}
            {fetching ? (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        bottom: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: '#0004',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItem: 'center',
                    }}
                >
                    <div style={{margin: 'auto'}}>
                        <h1>Fetching</h1>
                    </div>
                </div>
            ) : null}
        </FetchContext.Provider>
    );
};

export default App;
