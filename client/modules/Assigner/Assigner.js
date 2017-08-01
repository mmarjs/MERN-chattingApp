import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Card, CardHeader, CardActions, CardText } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import Chip from 'material-ui/Chip';
import QueueList from './components/QueueList';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';

// Import Style
import styles from './Assigner.css';

// Import Actions
import { fetchProjects, toggleProject, postSubmissions, fetchSubmission, fetchPositions, setError, cancelSubmission, notifyAssignedProject, refreshSubmission } from './AssignerActions';

// Import Selectors
import { getProjects, getPositions, getSelectedProjects, getSubmission, getError } from './AssignerReducer';

class Assigner extends Component {
  
  constructor(props) {
    super(props);
    this.state = {chipData: [
      {key: 0, label: 'Angular'},
      {key: 1, label: 'JQuery'},
      {key: 2, label: 'Polymer'},
      {key: 3, label: 'ReactJS'},
    ]};
    this.styles = {
      chip: {
        margin: 4,
      },
      selectedchip: {
        margin:4,
        backgroundColor:'#03A9F4',
      },
      wrapper: {
        display: 'flex',
        flexWrap: 'wrap',
      },
      startButton: {
        margin: 12
      }
    };
    this.pollingStarted = false;
  }
  
  componentDidMount() {
    this.props.dispatch(fetchProjects());
    this.props.dispatch(fetchSubmission());
  }

  startPollingPositions = (submissionId) => {
    if (!this.pollingStarted) {
      return;
    }
    console.log("Starting to poll!");
    console.log(submissionId);
    this.props.dispatch(fetchPositions(submissionId));
    setTimeout(() => this.startPollingPositions(submissionId), 120000);
  }

  startRefreshSubmission = (submission, timeout) => {
    if (!this.pollingStarted) {
      return;
    }
    console.log("Starting Refresh!");
    this.props.dispatch(refreshSubmission(submission.id));
    setTimeout(() => this.startRefreshSubmission(submission, timeout), timeout);
  }

  componentWillReceiveProps(nextProps) {
    // Fetch positions if we have a current submission
    if (!this.pollingStarted && nextProps.currentSubmission && nextProps.currentSubmission.id) {
      this.pollingStarted = true;
      this.startPollingPositions(nextProps.currentSubmission.id);
      // Set timer for refresh
      let endsAt = new Date(nextProps.currentSubmission.closed_at);
      let timeout = endsAt.getTime() - Date.now() - 300000; // minus 5 minutes
      this.startRefreshSubmission(nextProps.currentSubmission, timeout);
    }
  }

  handleToggleProject = (projectId) => {
    this.props.dispatch(toggleProject(projectId))
  }

  handlePostSubmissions = (selectedProjects) => {
    this.props.dispatch(postSubmissions(selectedProjects.map(value => {
      return {project_id: value.project_id, language: 'en-us'};
    })));
  }

  handleCancelSubmission = (submissionId) => {
    this.pollingStarted = false;
    this.props.dispatch(cancelSubmission(submissionId));
  }

  handleProjectAssigned = (projectId) => {
    // send email to user with the project projectId
    this.props.dispatch(notifyAssignedProject(projectId));
  }

  renderChip(data) {
    return (
      <Chip
        key={data.project_id}
        style={data.selected ? this.styles.selectedchip : this.styles.chip}
        labelColor={data.selected ? '#FF0000' : '#FF0000'}
        //labelColor={data.selected ? '#FFFFFF' : '#000000'}
        onClick={() => this.handleToggleProject(data.project_id)}
      >
        {data.project_id}
      </Chip>
    );
  }

  handleClose = () => {
    this.props.dispatch(setError(""));
  };
  
  render() {
    const actions = [
      <FlatButton
        label="OK"
        primary={true}
        onTouchTap={this.handleClose}
      />,
    ];
    return (
      <div>
        <Card expanded="true">
          <CardHeader
            title="Projects"
            subtitle="Select the projects to queue"
            actAsExpander={true}
            showExpandableButton={true}
          />
          
          <div style={this.styles.wrapper} >
            {this.props.projects.map(this.renderChip, this)}
          </div>

          <CardActions>
            <RaisedButton primary={true} label="Start"
                onClick={() => this.handlePostSubmissions(this.props.selectedProjects)}
                disabled={this.props.selectedProjects.length == 0 || this.props.currentSubmission.id}  style={this.styles.startButton} />
            <RaisedButton primary={true} label="Cancel"
                onClick={() => this.handleCancelSubmission(this.props.currentSubmission.id)}
                disabled={!this.props.currentSubmission.id}  style={this.styles.startButton} />
          </CardActions>
        </Card>
        <Toolbar>
          <ToolbarGroup firstChild={true}>
            <ToolbarTitle text={"Queuing Status: " + (this.pollingStarted ? "Started" : "Stopped")} />
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup>
            <ToolbarTitle text={"Next Refresh: " + (this.props.currentSubmission.closed_at ? this.props.currentSubmission.closed_at : "No Submission Yet!")} />
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup>
            <ToolbarTitle text={"Submission Status: " + (this.props.currentSubmission.status ? this.props.currentSubmission.status : "No Submission Yet!")} />
          </ToolbarGroup>
        </Toolbar>
        <QueueList queues={this.props.positions} handleProjectAssigned={this.handleProjectAssigned} />
        <Dialog
          title="API Error"
          actions={actions}
          modal={true}
          open={this.props.error && this.props.error.length > 0}
          onRequestClose={this.handleClose}
        >
        {this.props.error}
        </Dialog>
      </div>
    );
  }
}

Assigner.need = [() => { return fetchProjects(); }];

const mapStateToProps = (state) => {
  return {
    projects: getProjects(state),
    positions: getPositions(state),
    selectedProjects: getSelectedProjects(state),
    currentSubmission: getSubmission(state),
    error: getError(state)
  };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
   return { ...ownProps, ...stateProps, ...dispatchProps };
}

Assigner.propTypes = {
  projects: PropTypes.array,
  dispatch: PropTypes.func.isRequired,
  positions: PropTypes.array.isRequired,
  currentSubmission: PropTypes.object.isRequired,
  error: PropTypes.string,
  handleProjectAssigned: PropTypes.func.isRequired,
};

Assigner.contextTypes = {
  router: React.PropTypes.object,
};

export default connect(
  mapStateToProps,
)(Assigner);
