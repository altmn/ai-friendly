import unittest
from unittest.mock import Mock,patch
from rpc_client import Client
class CompletionIdentity(unittest.TestCase):
    def event(self,thread,turn):return {'method':'turn/completed','params':{'threadId':thread,'turn':{'id':turn}}}
    def test_old_turn_in_same_thread_does_not_complete_new_turn(self):self.assertFalse(Client.completed_turn(self.event('same','old'),'same','new'))
    def test_other_thread_does_not_complete_current_turn(self):self.assertFalse(Client.completed_turn(self.event('other','current'),'same','current'))
    def test_exact_thread_and_turn_complete(self):self.assertTrue(Client.completed_turn(self.event('same','current'),'same','current'))
    def test_unrelated_notification_does_not_complete(self):self.assertFalse(Client.completed_turn({'method':'item/completed','params':{}},'same','current'))

class DeadlineBehavior(unittest.TestCase):
    def client(self):
        c=object.__new__(Client);c.next_id=0;c.pending=[];c.send=Mock();c.close=Mock();return c
    def test_notifications_cannot_extend_rpc_deadline(self):
        c=self.client();c.read=Mock(return_value={'method':'noise'})
        with patch('rpc_client.time.monotonic',side_effect=[0,1,2,4]):
            with self.assertRaises(TimeoutError):c.call('probe',{},timeout=3)
        self.assertLessEqual(c.read.call_count,2)
    def test_turn_start_timeout_also_closes_owned_server(self):
        c=self.client();c.call=Mock(side_effect=TimeoutError('startup deadline'))
        with self.assertRaises(TimeoutError):c.turn('thread','text',timeout=1)
        c.close.assert_called_once()
    def test_compaction_ignores_old_completion_until_its_own_context_item(self):
        c=self.client();c.call=Mock(return_value={})
        c.read=Mock(side_effect=[
          {'method':'turn/completed','params':{'threadId':'same','turn':{'id':'old','status':'completed'}}},
          {'method':'item/started','params':{'threadId':'same','turnId':'compact','item':{'type':'contextCompaction'}}},
          {'method':'item/completed','params':{'threadId':'same','turnId':'compact','item':{'type':'contextCompaction'}}},
          {'method':'turn/completed','params':{'threadId':'same','turn':{'id':'compact','status':'completed'}}}])
        r=c.compact('same');self.assertEqual(r['events'][-1]['params']['turn']['id'],'compact')
    def test_compaction_timeout_closes_owned_server(self):
        c=self.client();c.call=Mock(return_value={});c.read=Mock(side_effect=TimeoutError('deadline'))
        with self.assertRaises(TimeoutError):c.compact('same')
        c.close.assert_called_once()
if __name__=='__main__':unittest.main()
