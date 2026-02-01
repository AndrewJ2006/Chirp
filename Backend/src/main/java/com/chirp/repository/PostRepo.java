package com.chirp.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.chirp.model.Post;
import com.chirp.model.User;


@Repository 
public interface PostRepo extends JpaRepository<Post, Long> {

    List<Post> findAllByAuthor(User author); // all post by single author
    List<Post> findAllByAuthorInOrderByCreatedAtDesc(List<User> authors); // gets posts from a list of authors (for feed), newest first

    //feed
    Page<Post> findAllByAuthorInOrderByCreatedAtDesc(List<User> authors, Pageable pageable); //returns posts by the given authors, sorted from newest to oldest.
                                                                                            //Pageable parameter tells it which “slice” of results to return and how to sort them.

}
    


/*   <S extends T> S save(Post post);
    Optional<Post> findById(Long id);
    void delete(Post post);
    Optional<Post> findAllByAuthor(User author);
    List<T> findAll();
    Optional<Post> findAllByAuthorInOrderByCreatedAtDesc(List<User> authors);
*/ 