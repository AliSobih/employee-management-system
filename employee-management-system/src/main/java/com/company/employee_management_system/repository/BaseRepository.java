package com.company.employee_management_system.repository;

import com.company.employee_management_system.entity.BaseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@NoRepositoryBean
public interface BaseRepository<T extends BaseEntity, ID> extends JpaRepository<T, ID> {

    @Query("SELECT e FROM #{#entityName} e WHERE e.isActive = true")
    List<T> findAllActive();

    @Query("SELECT e FROM #{#entityName} e WHERE e.isActive = false")
    List<T> findAllInactive();

    @Query("SELECT e FROM #{#entityName} e WHERE e.id = ?1 AND e.isActive = true")
    Optional<T> findActiveById(ID id);

    @Transactional
    @Modifying
    @Query("UPDATE #{#entityName} e SET e.isActive = false WHERE e.id = ?1")
    void softDelete(ID id);

    @Transactional
    @Modifying
    @Query("UPDATE #{#entityName} e SET e.isActive = true WHERE e.id = ?1")
    void restore(ID id);
}