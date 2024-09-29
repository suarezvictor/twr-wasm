#ifndef __TWR_AUDIO_H__
#define __TWR_AUDIO_H__

#ifdef __cplusplus
extern "C" {
#endif


__attribute__((import_name("twrAudioFromFloatPCM"))) long twr_audio_from_float_pcm(long num_channels, long sample_rate, float* data, long singleChannelDataLen);
__attribute__((import_name("twrAudioFrom8bitPCM"))) long twr_audio_from_8bit_pcm(long number_channels, long sample_rate, char* data, long singleChannelDataLen);
__attribute__((import_name("twrAudioFrom16bitPCM"))) long twr_audio_from_16bit_pcm(long number_channels, long sample_rate, short* data, long singleChannelDataLen);
__attribute__((import_name("twrAudioFrom32bitPCM"))) long twr_audio_from_32bit_pcm(long number_channels, long sample_rate, int* data, long singleChannelDataLen);

__attribute__((import_name("twrAudioGetFloatPCM"))) float* twr_audio_get_float_pcm(long node_id, long* singleChannelDataLenPtr, long* numChannelsPtr);
__attribute__((import_name("twrAudioGet8bitPCM"))) char* twr_audio_get_8bit_pcm(long node_id, long* singleChannelDataLenPtr, long* numChannelsPtr);
__attribute__((import_name("twrAudioGet16bitPCM"))) short* twr_audio_get_16bit_pcm(long node_id, long* singleChannelDataLenPtr, long* numChannelsPtr);
__attribute__((import_name("twrAudioGet32bitPCM"))) int* twr_audio_get_32bit_pcm(long node_id, long* singleChannelDataLenPtr, long* numChannelsPtr);

__attribute__((import_name("twrAudioPlay"))) long twr_audio_play(long node_id);
__attribute__((import_name("twrAudioPlay"))) long twr_audio_play_volume(long node_id, double volume, double pan);
__attribute__((import_name("twrAudioPlay"))) long twr_audio_play_callback(long node_id, double volume, double pan, int finish_callback);

struct PlayRangeFields {
   double pan, volume;
   int loop, finish_callback;
   long sample_rate;
};
struct PlayRangeFields twr_audio_default_play_range();
__attribute__((import_name("twrAudioPlayRange"))) long twr_audio_play_range(long node_id, long start_sample, long end_sample);
long twr_audio_play_range_ex(long node_id, long start_sample, long end_sample, struct PlayRangeFields* fields);

__attribute__((import_name("twrAudioPlaySync"))) long twr_audio_play_sync(long node_id);
__attribute__((import_name("twrAudioPlaySync"))) long twr_audio_play_sync_ex(long node_id, double volume, double pan);


struct PlayRangeSyncFields {
   double pan, volume;
   int loop;
   long sample_rate;
};
struct PlayRangeSyncFields twr_audio_default_play_range_sync();
__attribute__((import_name("twrAudioPlayRangeSync"))) long twr_audio_play_range_sync(long node_id, long start_sample, long end_sample);
long twr_audio_play_range_sync_ex(long node_id, long start_sample, long end_sample, struct PlayRangeSyncFields* fields);

__attribute__((import_name("twrAudioLoadSync"))) long twr_audio_load_sync(char* url);
__attribute__((import_name("twrAudioLoad"))) long twr_audio_load(int event_id, char* url);
__attribute__((import_name("twrAudioQueryPlaybackPosition"))) long twr_audio_query_playback_position(long playback_id);
__attribute__((import_name("twrAudioFreeID"))) void twr_audio_free_id(long node_id);

__attribute__((import_name("twrAudioStopPlayback"))) void twr_audio_stop_playback(long playback_id);

__attribute__((import_name("twrAudioModifyPlaybackVolume"))) void twr_audio_modify_playback_volume(long playback_id, double volume);
__attribute__((import_name("twrAudioModifyPlaybackPan"))) void twr_audio_modify_playback_pan(long playback_id, double pan);
__attribute__((import_name("twrAudioModifyPlaybackRate"))) void twr_audio_modify_playback_rate(long playback_id, double sample_rate);

__attribute__((import_name("twrAudioPlayFile"))) long twr_audio_play_file(char* file_url);
__attribute__((import_name("twrAudioPlayFile"))) long twr_audio_play_file_ex(char* file_url, double volume, double playback_rate, int loop);
struct AudioMetadata {
   long length;
   long sample_rate;
   long channels;
};

__attribute__((import_name("twrAudioGetMetadata"))) void twr_audio_get_metadata(long node_id, struct AudioMetadata* metadata);


#ifdef __cplusplus
}
#endif

#endif