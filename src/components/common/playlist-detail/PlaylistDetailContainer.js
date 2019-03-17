// @flow

import React, { Component } from 'react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Creators as PlaylistCreators } from '~/store/ducks/playlist';

import PlaylistDetailComponent from './components/PlaylistDetailComponent';
import { CustomAlert, TYPES } from '~/components/common/Alert';
import CONSTANTS from '~/utils/CONSTANTS';

type State = {
  isPlaylistAvailableOffline: boolean,
};

type Playlist = {
  isAvailableOffline: boolean,
  dowloads: Array<string>,
  podcasts: Array<Object>,
  title: string,
};

type LocalPodcastManager = {
  podcastsDownloaded: Array<Object>,
  downloadingList: Array<string>,
};

type Props = {
  localPodcastsManager: LocalPodcastManager,
  setOfflineAvailability: Function,
  downloadingList: Array<string>,
  removePodcast: Function,
  getPlaylist: Function,
  navigation: Object,
  playlist: Playlist,
};

class PlaylistDetailContainer extends Component<Props, State> {
  state = {
    isPlaylistAvailableOffline: false,
  };

  componentDidMount() {
    const { getPlaylist, navigation } = this.props;
    const { params } = navigation.state;

    const playlistTitle = params[CONSTANTS.PARAMS.PLAYLIST_TITLE];

    getPlaylist(playlistTitle);
  }

  componentWillReceiveProps(nextProps) {
    const { playlist } = nextProps;

    if (playlist.title) {
      const { isAvailableOffline } = playlist;

      this.setState({
        isPlaylistAvailableOffline: isAvailableOffline,
      });
    }
  }

  onPressPlayAllButton = (): void => {};

  onPressShuffleButton = (): void => {};

  onTogglePlaylistDownloadedSwitch = (): void => {
    const { setOfflineAvailability, playlist } = this.props;
    const { isPlaylistAvailableOffline } = this.state;

    this.setState({
      isPlaylistAvailableOffline: !isPlaylistAvailableOffline,
    });

    setOfflineAvailability(playlist, !isPlaylistAvailableOffline);
  };

  onRemovePodcastFromPlaylist = (podcastIndex: number): void => {
    const { removePodcast, playlist } = this.props;

    CustomAlert(TYPES.REMOVE_PODCAST_FROM_PLAYLIST, () => removePodcast(playlist, podcastIndex));
  };

  getPodcastsImages = (podcasts: Array<Object>): Array<string> => {
    let images = [];

    if (podcasts) {
      images = podcasts.slice(0, 4).map(podcast => podcast.imageURL);
    }

    return images;
  };

  getPodcastsWithDownloadStatus = (
    podcastsDownloaded: Array<Object>,
    downloadingList: Array<string>,
    podcasts: Array<Object>,
  ): Array<Object> => {
    const podcastsWithDownloadStatus = podcasts.map((podcast) => {
      const isPodcastBeenDownloaded = downloadingList.some(id => podcast.id);

      const isPodcastAlreadyDownloaded = podcastsDownloaded.some(
        podcastDownloaded => podcastDownloaded.id === podcast.id,
      );

      return {
        ...podcast,
        isDownloaded: isPodcastAlreadyDownloaded,
        isDownloading: isPodcastBeenDownloaded,
      };
    });

    return podcastsWithDownloadStatus;
  };

  render() {
    const { isPlaylistAvailableOffline } = this.state;
    const { localPodcastsManager, playlist } = this.props;

    const { downloadingList, podcastsDownloaded } = localPodcastsManager;
    const { podcasts, title } = playlist;

    const podcastsWithDownloadStatus = this.getPodcastsWithDownloadStatus(
      podcastsDownloaded,
      downloadingList,
      podcasts,
    );

    const podcastsImages = this.getPodcastsImages(podcasts);

    return (
      <PlaylistDetailComponent
        onTogglePlaylistDownloadedSwitch={this.onTogglePlaylistDownloadedSwitch}
        onRemovePodcastFromPlaylist={this.onRemovePodcastFromPlaylist}
        isPlaylistAvailableOffline={isPlaylistAvailableOffline}
        onPressPlayAllButton={this.onPressPlayAllButton}
        onPressShuffleButton={this.onPressShuffleButton}
        podcasts={podcastsWithDownloadStatus}
        downloadingList={downloadingList}
        podcastsImages={podcastsImages}
        title={title}
      />
    );
  }
}

const mapStateToProps = state => ({
  localPodcastsManager: state.localPodcastsManager,
  playlist: state.playlist.playlist,
});

const mapDispatchToProps = dispatch => bindActionCreators(PlaylistCreators, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PlaylistDetailContainer);
